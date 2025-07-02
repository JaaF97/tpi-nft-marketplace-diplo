const fs = require("fs");
const path = require("path");

function generateMetadata({ name, description, imageCID }) {
  const metadata = {
    name,
    description,
    image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
  };

  const tempPath = path.join(
    __dirname,
    "..",
    "temp",
    `${name.replace(/\s/g, "_")}_metadata.json`
  );
  fs.writeFileSync(tempPath, JSON.stringify(metadata, null, 2));
  return tempPath;
}

module.exports = { generateMetadata };
