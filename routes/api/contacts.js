const express = require('express');
const Joi = require('joi');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

const { HttpError } = require('../../helpers');

const router = express.Router();

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
})

router.get('/', async (req, res, next) => {
  try {
    const result = await listContacts();
    res.json(result);
  }
  catch (e) {
    res.status(500).json({
      message: "Server error "
    })
  }
})


router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await getContactById(contactId);
    if (!result) {
      throw HttpError(404, "Not found")
    }
    res.json(result);
  }
  catch (e) {
    next(e);
  }

})

router.post('/', async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    console.log(error);
    if (error) {
      throw HttpError(400, error.message);
    }
    const result = await addContact(req.body);
    res.status(201).json(result);
  }
  catch (e) {
    next(e);
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const data = await getContactById(contactId);
    if (!data) {
      throw HttpError(404, "Not found")
    }
    const result = await removeContact(contactId);
    res.status(200).json({
      "message": "contact deleted"
    });
  }
  catch (e) {
    next(e);
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body)

    if (!result) {
      throw HttpError(404, "Not found")
    }
    res.json(result);
  }
  catch (e) {
    next(e);
  }
})

module.exports = router
