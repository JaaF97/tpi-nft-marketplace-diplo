const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

async function uploadFileToPinata(filePath) {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      maxBodyLength: "Infinity",
      headers: {
        ...data.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    }
  );

  return res.data.IpfsHash; // Este es el CID
}

module.exports = { uploadFile: uploadFileToPinata };
