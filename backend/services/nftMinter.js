const { ethers } = require("hardhat");

async function mintNFT(contractAddress, to, metadataCID) {
  const nft = await ethers.getContractAt("TrinityNFT", contractAddress);
  const tx = await nft.mint(to, metadataCID);
  await tx.wait();
  console.log(`NFT minteado a ${to} con metadata CID: ${metadataCID}`);
}

module.exports = { mintNFT };
