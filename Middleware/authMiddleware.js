const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');

            // Find user id from token
            // Their token payload likely uses { id: user._id } or { userId: user._id }
            const userId = decoded.userId || decoded.id; 

            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            // Find associated doctor
            const doctor = await Doctor.findOne({ user: user._id });
            if (!doctor) {
                return res.status(401).json({ success: false, message: 'Not authorized, doctor profile not found' });
            }

            req.user = user;
            req.doctor = doctor;

            next();
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
