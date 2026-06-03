const dotenv = require('dotenv');
dotenv.config();
const User = require('../Models/user.model');
const Admin = require('../Models/admin.model');
const jwt = require('jsonwebtoken'); 
const { updateAdminProfile } = require('../Controllers/Admin.controller');

const protectAdmin = () => async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        let token;

        if (header && header.startsWith('Bearer')) {
            token = header.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token!'
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Access Token Expired, please login again'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid Token'
            });
        }

        if (decoded.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admins only!'
            });
        }

        const admin = await Admin.findById(decoded.user_id).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin Not Found!'
            });
        }

        req.user = admin;
        next();

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


module.exports = {protectAdmin};
