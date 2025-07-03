const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Desplegando contrato TrinityNFTCollection con la cuenta:",
    deployer.address
  );

  const TrinityNFTCollection = await ethers.getContractFactory(
    "TrinityNFTCollection"
  );
  const nft = await TrinityNFTCollection.deploy();

  await nft.waitForDeployment();

  console.log("TrinityNFTCollection desplegado en:", nft.target);
  console.log("Nombre:", await nft.name());
  console.log("Símbolo:", await nft.symbol());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
