const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerFactory = () => {
  const multerStorage = multer.memoryStorage();

  const filefilters = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only image is allowed', 400), false);
    }
  };
  const upload = multer({ storage: multerStorage, fileFilter: filefilters });
  return upload;
};

exports.uploadSingleImage = (fieldName) => multerFactory().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerFactory().fields(arrayOfFields);
