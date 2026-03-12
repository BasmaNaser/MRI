const { validationResult, matchedData } = require('express-validator');

function checkError(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = {};

        errors.array().forEach(err => {
            const key = err.path || 'general'; 

            if (messages[key]) {
                if (Array.isArray(messages[key])) {
                    messages[key].push(err.msg);
                } else {
                    messages[key] = [messages[key], err.msg];
                }
            } else {
                messages[key] = err.msg;
            }
        });

        console.log(errors.array());
        return res.status(400).json({
            success: false,
            messages
        });
    }

    req.safeData = matchedData(req); 
    next();
}

module.exports = checkError;