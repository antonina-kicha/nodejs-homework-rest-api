const { Schema, model } = require('mongoose');
const { handleMongooseError } = require("../helpers");
const Joi = require('joi');


const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
}, { versionKey: false, timestamps: true }
);

contactSchema.post("save", handleMongooseError);

const addSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    favorite: Joi.boolean(),

})

const updateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    favorite: Joi.boolean(),
}).min(1);

const updateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
});

const Contact = model('contact', contactSchema);

module.exports = {
    Contact,
    addSchema,
    updateSchema,
    updateFavoriteSchema,
};

