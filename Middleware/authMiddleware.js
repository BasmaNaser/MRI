const jwt = require('jsonwebtoken');
const User = require('../Models/user.model');
const Doctor = require('../Models/doctor.model');
const Patient = require('../Models/patient.model');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token using the unified secret
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // The unified token uses user_id
            const userId = decoded.user_id;

            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            req.user = user;

            // Optional: Attach specialized profile based on role
            if (user.role === 'Doctor') {
                const doctor = await Doctor.findOne({ user: user._id });
                req.doctor = doctor;
            } else if (user.role === 'Patient') {
                const patient = await Patient.findOne({ user: user._id });
                req.patient = patient;
            }

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
