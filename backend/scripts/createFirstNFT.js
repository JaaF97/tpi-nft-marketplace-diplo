const { uploadImageAndMetadata } = require("../utils/uploadMetadata");
const { mintNFT } = require("../services/nftMinter");
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const imagePath = "./assets/img_TrinityNFT.png";
  const name = "Trinity Genesis NFT";
  const description = "Primer NFT creado para TrinityMarketplace";

  console.log("Subiendo imagen y generando metadata...");
  const metadataCID = await uploadImageAndMetadata(
    imagePath,
    name,
    description
  );

  const metadataURL = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;
  console.log("Metadata subida a IPFS:");
  console.log("CID: ", metadataCID);
  console.log("URL pública: ", metadataURL);

  const [owner] = await ethers.getSigners();

  // Reemplazar por la dirección resultante del último deploy
  const nftAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("\nMinteando NFT...");
  await mintNFT(nftAddress, owner.address, metadataCID);

  console.log("NFT creado correctamente.");
  console.log("TokenURI (esperado):", metadataURL);
}

main().catch((err) => {
  console.error("Error durante el proceso:", err);
  process.exit(1);
});
