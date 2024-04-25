const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');
const config = require('./config');

const imageStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const destDir = path.join(config.publicPath, 'images');
    await fs.mkdir(destDir, {recursive: true});
    cb(null, config.publicPath);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, 'images/' + randomUUID() + extension);
  }
});

exports.imagesUpload = multer({storage: imageStorage});