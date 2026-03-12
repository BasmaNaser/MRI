const { body } = require('express-validator');
const signupValidation = [
    body('username').isString().withMessage('Username required').trim(),
    body('email').isEmail().withMessage('Email Must be Valid').trim(),
    body('password').isLength({ min: 8 }).withMessage('Password required with min 8 chars'),
    body('confirmedPassword').isLength({ min: 8 }).withMessage('confirmedPassword required with min 8 chars'),
    body('confirmedPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('role').isIn(['Patient', 'Doctor']).withMessage('Role must be Patient or Doctor')
];
module.exports=signupValidation;