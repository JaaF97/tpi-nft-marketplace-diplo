const { ethers } = require("hardhat");

async function main() {
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.deploy();
  console.log("DiploToken desplegado en:", token.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
