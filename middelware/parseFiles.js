import multer from "multer";

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Math.round(Math.random() * 9999);
    cb(null, uniqueSuffix + file.originalname);
  },
});

function fileFilter(req, file, cb) {
  console.log(file,"vvvvvvvvvvvv");
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  }
  cb(null, false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 4 },
});

export default upload;
