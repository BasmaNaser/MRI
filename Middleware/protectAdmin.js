const protect = require('./protect');

const protectAdmin = () => protect('Admin');

module.exports = {protectAdmin};
