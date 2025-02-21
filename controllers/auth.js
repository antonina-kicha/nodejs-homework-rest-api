const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require("jimp");
const { nanoid } = require('nanoid');

const { User } = require('../models/user');
const { handleMongooseError, HttpError, sendEmail } = require("../helpers");
const { json } = require('express');
const { SECRET_KEY, PROJECT_URL } = process.env;

const avatarsDir = path.join(__dirname, '../', "public", "avatars")

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            throw HttpError(409, "Email in use");
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = nanoid();
        const avatarURL = gravatar.url(email);

        const newUser = await User.create({ ...req.body, password: hashPassword, verificationToken, avatarURL });
        const verifyEmail = {
            to: email,
            subject: "Verify email",
            html: `<a target="_blank" href="${PROJECT_URL}/users/verify/${verificationToken}">Click to verify email</a >`,
        }
        await sendEmail(verifyEmail);

        res.status(201).json({
            email: newUser.email,
            subscription: newUser.subscription,
        });
    }
    catch (e) {
        console.log(e);
        next(e);
    }
};

const verify = async (req, res) => {
    try {
        const { verificationToken } = req.params;
        const user = await User.findOne({ verificationToken });
        if (!user) {
            throw HttpError(404, "User not found");
        }
        await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });
        res.json({
            message: "Verification successful"
        })
    }
    catch (e) {
        next(e);
    }
};

const resendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw HttpError(404, "User not found");
        }
        if (user.verify) {
            throw HttpError(400, "Verification has already been passed");
        }
        const verifyEmail = {
            To: email,
            Subject: "Verify email",
            HTMLPart: `<a target="_blank" href="${PROJECT_URL}/users/verify/:${verificationToken}">Click to verify email</a >`,
        }
        await sendEmail(verifyEmail);
        res.json({
            message: "Verified email send"
        })
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
        if (!user.verify) {
            throw HttpError(401, "Email is not verify");
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

const updateAvatar = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { path: tempUpload, originalname } = req.file;
        const image = await Jimp.read(tempUpload);
        await image.resize(250, 250).writeAsync(tempUpload);
        const filename = `${_id}_${originalname}`;
        const resultUpload = path.join(avatarsDir, filename);
        await fs.rename(tempUpload, resultUpload);
        const avatarURL = path.join("avatars", filename)
        await User.findByIdAndUpdate(_id, { avatarURL });

        res.json({
            avatarURL,
        })

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
    updateAvatar,
    verify,
    resendVerifyEmail,
}
