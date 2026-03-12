const bcrypt = require('bcrypt');
require('dotenv').config();

async function Hashedpassword(password) {
    try {
        const SaltRound = parseInt(process.env.SALTROUND);
        return await bcrypt.hash(password, SaltRound);
    } catch (error) {
        console.log(error);
    }
}

module.exports = Hashedpassword;