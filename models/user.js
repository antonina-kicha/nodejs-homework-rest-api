const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require("../helpers");

const emailRegExp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/;
const passwordRegExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

const userSchema = new Schema({
    password: {
        type: String,
        match: passwordRegExp,
        minlength: 6,
        required: [true, 'Password is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: emailRegExp,
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
        type: String,
        default: null,
    },
    avatarURL: {
        type: String,
    },
}, { versionKey: false, timestamps: true });

userSchema.post("save", handleMongooseError);

const userRegisterSchema = Joi.object({
    password: Joi.string().pattern(passwordRegExp).min(6).required(),
    email: Joi.string().pattern(emailRegExp).required(),
    subscription: Joi.string(),
});

const userLoginSchema = Joi.object({
    password: Joi.string().pattern(passwordRegExp).min(6).required(),
    email: Joi.string().pattern(emailRegExp).required(),
})

const schemas = {
    userRegisterSchema,
    userLoginSchema,
};
const User = model('user', userSchema);

module.exports = {
    User,
    schemas,
};
