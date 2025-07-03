const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const recipient = "0xCc6837420847F86D390b35a168aD252ecF89f447"; // 🔁 Reemplazá con la dirección deseada
  const amount = ethers.parseUnits("1000", 18); // 🔁 Monto a mintear

  const tokenAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // 🔁 Dirección del contrato DIP desplegado
  const DiploToken = await ethers.getContractAt("DiploToken", tokenAddress);

  const tx = await DiploToken.mint(recipient, amount);
  await tx.wait();

  console.log(`✅ Se mintearon ${ethers.formatUnits(amount, 18)} DIP a ${recipient}`);
}

main().catch((error) => {
  console.error(" Error al mintear DIP:", error);
  process.exit(1);
});