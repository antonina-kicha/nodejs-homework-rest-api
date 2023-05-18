const express = require('express');

const { Contact, addSchema, updateSchema, updateFavoriteSchema } = require('../../models/contact');

const { HttpError } = require('../../helpers');

const { isValidId, authenticate } = require('../../middlewares');

const router = express.Router();

// Read all contacts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    console.timeLog(owner);
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner }, "-createdAt -updatedAt", { skip, limit }).populate("owner", "_id email subscription");
    res.json(result);
  }
  catch (e) {
    res.status(500).json({
      message: "Server error "
    })
  }
})

// Read contact by id
router.get('/:contactId', authenticate, isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    console.log(contactId, owner);

    const result = await Contact.findOne({ _id: contactId, owner });
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
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    console.log(error);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { _id: owner } = req.user;
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  }
  catch (e) {
    next(e);
  }
})

// Remove contact by id
router.delete('/:contactId', authenticate, isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;

    const result = await Contact.findOneAndRemove({ _id: contactId, owner });
    if (!result) {
      throw HttpError(404, "Not found")
    }
    res.status(200).json({
      "message": "contact deleted"
    });
  }
  catch (e) {
    next(e);
  }
})

// UpdateContact
router.put('/:contactId', authenticate, isValidId, async (req, res, next) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const { _id: owner } = req.user;

    const result = await Contact.findOneAndUpdate({ _id: contactId, owner }, req.body, { new: true })
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
router.patch('/:contactId/favorite', authenticate, isValidId, async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing field favorite");
    }
    const { contactId } = req.params;
    const data = await Contact.findOne({ _id: contactId, owner });
    if (!data) {
      throw HttpError(404, "Not found")
    }
    const result = await Contact.findByIdAndUpdate(contactId, req.body, { new: true })

    res.json(result);
  }
  catch (e) {
    next(e);
  }
})

module.exports = router