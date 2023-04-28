const express = require('express');

const { Contact, addSchema, updateSchema, updateFavoriteSchema } = require('../../models/contact');

const { HttpError } = require('../../helpers');

const { isValidId } = require('../../middlewares');

const router = express.Router();

// Read all contacts
router.get('/', async (req, res, next) => {
  try {
    const result = await Contact.find();
    res.json(result);
  }
  catch (e) {
    res.status(500).json({
      message: "Server error "
    })
  }
})

// Read contact by id
router.get('/:contactId', isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      throw HttpError(404, "Not found")
    }
    res.json(result);
  }
  catch (e) {
    next(e);
  }

})

// Add contact
router.post('/', async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    console.log(error);
    if (error) {
      throw HttpError(400, error.message);
    }
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  }
  catch (e) {
    next(e);
  }
})

// Remove contact by id
router.delete('/:contactId', isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const data = await Contact.findById(contactId);
    if (!data) {
      throw HttpError(404, "Not found")
    }
    const result = await Contact.findByIdAndRemove(contactId);
    res.status(200).json({
      "message": "contact deleted"
    });
  }
  catch (e) {
    next(e);
  }
})

// UpdateContact
router.put('/:contactId', isValidId, async (req, res, next) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, { new: true })

    if (!result) {
      throw HttpError(404, "Not found")
    }
    res.json(result);
  }
  catch (e) {
    next(e);
  }
})

// UpdateContactFieldFavorite
router.patch('/:contactId/favorite', isValidId, async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing field favorite");
    }
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, { new: true })

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