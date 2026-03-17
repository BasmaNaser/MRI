// middlewares/multerConfig.js
const multer = require('multer');
const path = require('path');

const uploadFile = (folder) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `uploads/${folder}`);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/; 
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (extname && mimeType) cb(null, true);
        else cb(new Error('Only images or PDF files are allowed'));
    };

    return multer({ storage, fileFilter });
};

module.exports = uploadFile;