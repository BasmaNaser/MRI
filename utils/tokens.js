const jwt = require('jsonwebtoken');
require('dotenv').config();

function createAccessToken(user_id, role) {
    try {
        const payload = { user_id, role };
        const option = { expiresIn: '20m' };
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, option);
    } catch (error) {
        console.log(error);
    }
}

function createAutoToken(user_id, role) {
    try {
        const payload = { user_id, role };
        const option = { expiresIn: '15m' };
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, option);
    } catch (error) {
        console.log(error);
    }
}

function createRefreshToken(user_id, role) {
    try {
        const payload = { user_id, role };
        const option = { expiresIn: '1y' };
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, option);
    } catch (error) {
        console.log(error);
    }
}

function createResetToken(user_id, role) {
    try {
        const payload = { user_id, role };
        const option = { expiresIn: '10m' };
        return jwt.sign(payload, process.env.RESET_TOKEN_SECRET, option);
    } catch (error) {
        console.log(error);

    }
}

module.exports = { createAccessToken,createAutoToken, createRefreshToken, createResetToken };