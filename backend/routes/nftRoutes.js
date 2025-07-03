const express = require("express");
const multer = require("multer");
const { uploadNft } = require("../controllers/nftController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // carpeta temporal para multer

router.post("/upload", upload.single("file"), uploadNft);

module.exports = router;
