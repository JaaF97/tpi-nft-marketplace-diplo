const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Desplegando contrato DiploToken con la cuenta:",
    deployer.address
  );

  const initialSupply = ethers.parseEther("1000000");
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.deploy(initialSupply);

  await token.waitForDeployment();

  console.log("DiploToken desplegado en:", token.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
