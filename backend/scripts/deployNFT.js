const { ethers } = require("hardhat");

async function main() {
  const TrinityNFT = await ethers.getContractFactory("TrinityNFT");
  const nft = await TrinityNFT.deploy();

  await nft.waitForDeployment();

  console.log("TrinityNFT desplegado en:", nft.target);
  console.log("Nombre:", await nft.name());
  console.log("Símbolo:", await nft.symbol());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
