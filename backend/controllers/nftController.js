const { uploadImageAndMetadata } = require("../utils/uploadMetadata");
const path = require("path");

const uploadNft = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imagePath = path.resolve(imageFile.path);
    const metadataCID = await uploadImageAndMetadata(imagePath, name, description);

    res.json({ ipfsCID: metadataCID });
  } catch (error) {
    console.error("Error uploading NFT:", error);
    res.status(500).json({ error: "Failed to upload NFT to IPFS" });
  }
};

module.exports = { uploadNft };
