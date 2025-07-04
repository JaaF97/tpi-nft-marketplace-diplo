// scripts/updateContractAddresses.js
const fs = require("fs");
const path = require("path");

const deployPath = path.resolve(__dirname, "..", "deploy_output.json");
const indexPath = path.resolve(__dirname, "..", "frontend", "src", "constants", "index.js");

function main() {
  if (!fs.existsSync(deployPath)) {
    console.error("❌ No se encontró deploy_output.json");
    process.exit(1);
  }

  const { diploToken, nft, marketplace } = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  let content = fs.readFileSync(indexPath, "utf8");

  content = content
    .replace(/export const TOKEN_ADDRESS = ".*?";/, `export const TOKEN_ADDRESS = "${diploToken}";`)
    .replace(/export const NFT_ADDRESS = ".*?";/, `export const NFT_ADDRESS = "${nft}";`)
    .replace(/export const MARKETPLACE_ADDRESS = ".*?";/, `export const MARKETPLACE_ADDRESS = "${marketplace}";`);

  fs.writeFileSync(indexPath, content);
  console.log("✅ Direcciones actualizadas en index.js");
}

main();
