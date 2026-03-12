const dotenv = require('dotenv');
dotenv.config();
const User = require('../Models/user.model');
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

        const user = await User.findById(decode.user_id).select('-password');
        if (!user) {
            const error=new Error('User Not Found!');
            error.statusCode=404;
            return next(error);
           
        }

        if (role && user.role !== role) {
            const error=new Error('Forbidden: You do not have access!');
            error.statusCode=403;
            return next(error);
            
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = protect;