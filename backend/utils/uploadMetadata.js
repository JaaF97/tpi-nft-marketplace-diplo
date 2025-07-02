const { uploadFile } = require("./uploadFile");
const { generateMetadata } = require("./generateMetadata");

async function uploadImageAndMetadata(imagePath, name, description) {
  const imageCID = await uploadFile(imagePath);
  const metadataPath = generateMetadata({ name, description, imageCID });
  const metadataCID = await uploadFile(metadataPath);
  return metadataCID;
}

module.exports = { uploadImageAndMetadata };
