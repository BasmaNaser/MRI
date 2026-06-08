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
        new Error(
            'Only JPG, PNG, PDF, NII and NII.GZ files are allowed'
        )
    );
};

    return multer({ storage, fileFilter });
};

module.exports = uploadFile;
