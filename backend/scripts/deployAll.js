const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con:", deployer.address);

  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.deploy();
  await token.waitForDeployment();
  console.log("DiploToken:", token.target);

  const TrinityNFT = await ethers.getContractFactory("TrinityNFT");
  const nft = await TrinityNFT.deploy();
  await nft.waitForDeployment();
  console.log("TrinityNFT:", nft.target);

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(nft.target, token.target);
  await marketplace.waitForDeployment();
  console.log("Marketplace:", marketplace.target);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
