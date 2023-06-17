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
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: [true, 'Verify token is required'],
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

const userEmailSchema = Joi.object({
    email: Joi.string().pattern(emailRegExp).required(),
});

const schemas = {
    userRegisterSchema,
    userLoginSchema,
    userEmailSchema,
};
const User = model('user', userSchema);

module.exports = {
    User,
    schemas,
};
