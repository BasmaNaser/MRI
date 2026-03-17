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
const validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required')
        .isLength({ min: 8 }).withMessage('Current password must be at least 8 characters'),
    
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[0-9]/).withMessage('New password must contain at least one number')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter'),

    body('confirmNewPassword')
        .notEmpty().withMessage('Confirm new password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Confirm password does not match new password');
            }
            return true;
        })
];

const updateProfileValidation = [

    body('username')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format')
        .custom(async (email, { req }) => {

            const existingUser = await User.findOne({ email });

            if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {

                throw new Error('Email already exists');
            }

            return true;
        }),

    body('doctorId')
        .optional()
        .isMongoId()
        .withMessage('Invalid doctor ID')
        .custom(async (doctorId) => {

            const doctor = await Doctor.findById(doctorId);

            if (!doctor) {
                throw new Error('Doctor not found');
            }

            return true;
        })

];
module.exports={signupValidation,validateChangePassword,updateProfileValidation};