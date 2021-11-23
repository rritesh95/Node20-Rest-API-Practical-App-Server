const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
//PUT auth/signup
router.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email.')
            .normalizeEmail()
            .custom((value, { req } ) => {
                return User.findOne({ email : value })
                    .then(userData => {
                        if(userData){
                            return Promise.reject('Email already exist!');
                        }
                    })
            }),
        body('password')
            .trim()
            .isLength({ min : 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.signup
);

router.post(
    '/login', 
    [
        body('email')
            .normalizeEmail()
            .not()
            .isEmpty(),
        body('password')
            .trim()
            .isLength({ min : 5 })
            .not()
            .isEmpty()
    ],
    authController.login
);

router.get('/status', isAuth, authController.getUserStatus);

router.put('/status', isAuth, [
  body('status').trim().not().isEmpty()  
],authController.updateUserStatus);

module.exports = router;