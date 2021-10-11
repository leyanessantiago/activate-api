const MYME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

export function imageFilter(_, file, callback) {
  const hasValidExt = file.originalname.match(/\.(jpg|jpeg|png)$/);
  const hasValidType = MYME_TYPE_MAP[file.mimetype];
  const isValid = hasValidExt && hasValidType;

  if (!isValid) {
    callback(new Error('Only image files are allowed'), false);
  } else {
    callback(null, true);
  }
}

export function renameImageFile(req, file, callback) {
  const ext = MYME_TYPE_MAP[file.mimetype];
  callback(null, `${req.user.sub}.${ext}`);
}
