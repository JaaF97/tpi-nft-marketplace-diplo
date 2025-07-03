const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con:", deployer.address);

  const initialSupply = ethers.parseEther("1000000");
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.deploy(initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("DiploToken desplegado en:", tokenAddress);

  const TrinityNFTCollection = await ethers.getContractFactory(
    "TrinityNFTCollection"
  );
  const nft = await TrinityNFTCollection.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("TrinityNFTCollection desplegado en:", nftAddress);

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace desplegado en:", marketplaceAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
