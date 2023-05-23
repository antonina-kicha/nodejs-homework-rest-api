const express = require('express');
const { validateBody, authenticate } = require('../../middlewares');
const { schemas } = require('../../models/user');
const controllers = require('../../controllers/auth');

const router = express.Router();

router.post('/register', validateBody(schemas.userRegisterSchema), controllers.register);

router.post('/login', validateBody(schemas.userLoginSchema), controllers.login);

router.get('/current', authenticate, controllers.getCurrent);

router.post('/logout', authenticate, controllers.logout);


module.exports = router;
