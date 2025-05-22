const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        const prefix = req.uploadType || 'file';
        cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    return mimetype && extname ? cb(null, true) : cb(new Error('Only JPEG/PNG files allowed'));
};

const uploadCategoryImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
}).single('categoryImage');

const uploadUserImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
}).single('image');

const uploadProductImages = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 6 },
}).array('productImages');

module.exports = {
    uploadCategoryImage,
    uploadProductImages,
    uploadUserImage,
};