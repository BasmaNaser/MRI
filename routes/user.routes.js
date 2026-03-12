const express=require('express');
const userRouter=express.Router();
const signupValidation=require('../Middleware/Validation');
const checkError=require('../Middleware/errorMessage')
const {signupController,loginController,tokenLoginController,refreshTokenController,forgetPasswordController,resetPasswordController,getAllUsers}=require('../Controllers/auth.controller')


/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirmedPassword
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: John
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               confirmedPassword:
 *                 type: string
 *                 example: 12345678
 *               role:
 *                 type: string
 *                 example: Patient
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
userRouter.post('/signup',signupValidation,checkError,signupController);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailUsername
 *               - password
 *             properties:
 *               emailUsername:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid username or password
 *       401:
 *         description: User not found
 */
userRouter.post('/login',loginController);
/**
 * @swagger
 * /users/token-login:
 *   get:
 *     summary: Auto-login using access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid. Auto-login successful!
 *       401:
 *         description: Invalid or expired token
 */
userRouter.post('/token-login',tokenLoginController);
/**
 * @swagger
 * /users/refresh-token:
 *   get:
 *     summary: Refresh access token using refresh token (stored in cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Refresh token missing or invalid
 */
userRouter.post('/refresh-token',refreshTokenController);
/**
 * @swagger
 * /users/forget-password:
 *   post:
 *     summary: Send reset password email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset email sent (if user exists)
 *       400:
 *         description: Email required
 */
userRouter.post('/forget-password',forgetPasswordController);
/**
 * @swagger
 * /users/reset-password/{token}:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmedPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: 12345678
 *               confirmedPassword:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired token
 */
userRouter.post('/reset-password/:token',resetPasswordController);
userRouter.post('/login-token',tokenLoginController)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: John
 *                   email:
 *                     type: string
 *                     example: john@example.com
 *                   role:
 *                     type: string
 *                     example: Patient
 *       401:
 *         description: Unauthorized, token missing or invalid
 */
userRouter.get('/',getAllUsers);
module.exports=userRouter;