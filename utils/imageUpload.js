const multer = require('multer');


const bannerImgStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `${__dirname}/../public/images`);
  },
  filename(req, file, cb) {
    const ext = file.originalname.split('.');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `banner-image-${uniqueSuffix}.${ext[ext.length - 1]}`);
  },
});

const uploadBannerImage = multer({
  storage: bannerImgStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only PNG and JPG images are allowed.'));
    }
    if (file.size > 1024 * 1024) {
      return cb(new Error('Image should be less than 1MB.'));
    }
    cb(null, true);
  },
  limits: {
    files: 1, // Limit to only one image
  }
}).single('image');
const conditionalUpload = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    uploadBannerImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  } else {
    next();
  }
};
