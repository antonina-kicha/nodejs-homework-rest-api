const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const { User } = require('../models/user');
const { handleMongooseError, HttpError } = require("../helpers");
const { SECRET_KEY } = process.env;

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            throw HttpError(409, "Email in use");
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ ...req.body, password: hashPassword });
        res.status(201).json({
            email: newUser.email,
            subscription: newUser.subscription,
        });
    }
    catch (e) {
        next(e);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw HttpError(401, "Email or password is wrong");
        }

        const passwordCompare = await bcrypt.compare(password, user.password);

        if (!passwordCompare) {

            throw HttpError(401, "Email or password is wrong");
        }

        const payload = {
            id: user._id,
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
        await User.findByIdAndUpdate(user._id, { token });

        res.json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription,
            },
        })
    }
    catch (e) {
        next(e);
    }
};

const getCurrent = async (req, res, next) => {
    try {
        const { email, subscription } = req.user;
        res.json({
            email,
            subscription,
        });
    }
    catch (e) {
        next(e);
    }
};

const logout = async (req, res, next) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { token: null });

        res.status(204).json({ message: "No Content" })
    }
    catch (e) {
        next(e);
    }
};

module.exports = {
    register,
    login,
    getCurrent,
    logout,
}
