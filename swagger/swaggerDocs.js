/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication APIs for Brain MRI System
 */

/**
 * @swagger
 * /signup:
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
 *                 example: patient
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /login:
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Refresh token missing or invalid
 */

/**
 * @swagger
 * /token-login:
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

/**
 * @swagger
 * /forget-password:
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
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent (if exists)
 */

/**
 * @swagger
 * /reset-password/{token}:
 *   post:
 *     summary: Reset password using token
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
