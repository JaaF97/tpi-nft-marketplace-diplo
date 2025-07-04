const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Desplegando contratos con:", deployer.address);

  // 1. Desplegar DiploToken
  const initialSupply = ethers.parseEther("1000000");
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.deploy(initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ DiploToken desplegado en:", tokenAddress);

  // 2. Desplegar colección de NFTs
  const TrinityNFTCollection = await ethers.getContractFactory("TrinityNFTCollection");
  const nft = await TrinityNFTCollection.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ TrinityNFTCollection desplegado en:", nftAddress);

  // 3. Desplegar Marketplace, recibe dirección del token
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace desplegado en:", marketplaceAddress);

  // 4. Guardar direcciones en un archivo JSON
  const output = {
    diploToken: tokenAddress,
    nft: nftAddress,
    marketplace: marketplaceAddress,
  };

  const outputPath = path.resolve(__dirname, "..", "deploy_output.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`📄 Direcciones guardadas en: ${outputPath}`);

  // 5. Ejecutar script para actualizar index.js en frontend
  console.log("🔁 Actualizando archivo de constantes en el frontend...");
  execSync("node scripts/updateContractAddresses.js", { stdio: "inherit" });
}

main().catch((err) => {
  console.error("❌ Error al desplegar contratos:", err);
  process.exit(1);
});
