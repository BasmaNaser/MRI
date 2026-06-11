// middlewares/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Root of the project (one level up from /Middleware)
const PROJECT_ROOT = path.join(__dirname, '..');

const uploadFile = (folder) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            // Use absolute path so multer always finds the folder
            // regardless of what CWD Node.js was started from
            const absolutePath = path.join(PROJECT_ROOT, 'uploads', folder);
            fs.mkdirSync(absolutePath, { recursive: true });
            cb(null, absolutePath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const filename = file.originalname.toLowerCase();

        if (
            filename.endsWith('.jpg') ||
            filename.endsWith('.jpeg') ||
            filename.endsWith('.png') ||
            filename.endsWith('.pdf') ||
            filename.endsWith('.nii') ||
            filename.endsWith('.nii.gz')
        ) {
            return cb(null, true);
        }

        return cb(
            new Error('Only JPG, PNG, PDF, NII and NII.GZ files are allowed')
        );
    };

    return multer({ storage, fileFilter });
};

module.exports = uploadFile;
