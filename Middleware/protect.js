const dotenv = require('dotenv');
dotenv.config();
const User = require('../Models/user.model');
const Admin = require('../Models/admin.model');
const Doctor = require('../Models/doctor.model');
const Patient = require('../Models/patient.model');
const jwt = require('jsonwebtoken'); 

const protect = (role) => async (req, res, next) => {
    try {
        const header = req.headers.authorization; 
        let token;
        if (header && header.startsWith('Bearer')) {
            token = header.split(' ')[1];
        }

        if (!token) {
            const error=new Error('Not authorized, no token!');
            error.statusCode=401;
            return next(error);
    
        }

        let decode;
        try {
            decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                const error = new Error('Access Token Expired, please login again');
                error.statusCode = 401;
                return next(error);
            } else {
                const error = new Error('Invalid Token');
                error.statusCode = 401;
                return next(error);
            }
        }

        const tokenRole = decode.role;
        const userId = decode.user_id || decode.userId || decode.id;

        if (!userId || !tokenRole) {
            const error = new Error('Invalid Token');
            error.statusCode = 401;
            return next(error);
        }

        let user;
        let accountRole = tokenRole;

        if (tokenRole === 'Admin') {
            user = await Admin.findById(userId);
        } else {
            user = await User.findById(userId);
            accountRole = user?.role;
        }

        if (!user) {
            const error = new Error(`${tokenRole} Not Found!`);
            error.statusCode = 404;
            return next(error);
        }

        if (tokenRole !== accountRole) {
            const error = new Error('Invalid Token');
            error.statusCode = 401;
            return next(error);
        }

        const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
        if (allowedRoles.length && !allowedRoles.includes(accountRole)) {
            const error=new Error('Forbidden: You do not have access!');
            error.statusCode=403;
            return next(error);
            
        }

        req.user = user;
        req.auth = { userId: user._id, role: accountRole };

        if (accountRole === 'Doctor') {
            const doctor = await Doctor.findOne({ user: user._id });
            if (!doctor) {
                const error = new Error('Doctor profile not found!');
                error.statusCode = 404;
                return next(error);
            }
            req.doctor = doctor;
        }

        if (accountRole === 'Patient') {
            const patient = await Patient.findOne({ user: user._id });
            if (patient) {
                req.patient = patient;
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = protect;
