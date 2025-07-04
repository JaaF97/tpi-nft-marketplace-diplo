const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Leer la dirección del contrato desde el JSON generado por deployAll.js
  const deploymentPath = path.resolve(__dirname, "..", "deploy_output.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const diploTokenAddress = deployment.diploToken;

  const amount = ethers.parseEther("1000");

  const signers = await ethers.getSigners();
  const owner = signers[0]; // cuenta que puede mintear

  const DiploToken = await ethers.getContractAt("DiploToken", diploTokenAddress);

  console.log("🔁 Minteando tokens a las 20 cuentas...");

  for (let i = 0; i < signers.length; i++) {
    const addr = await signers[i].getAddress();
    const tx = await DiploToken.connect(owner).mint(addr, amount);
    await tx.wait();
    console.log(`✅ ${i + 1}) Minteado ${ethers.formatUnits(amount, 18)} DIP a ${addr}`);
  }

  // Guardar las direcciones en un JSON para referencia
  const addresses = await Promise.all(signers.map(s => s.getAddress()));
  const outputPath = path.resolve(__dirname, "..", "cuentas_minteadas.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("📄 Direcciones guardadas en cuentas_minteadas.json");

  console.log("🎉 Todas las cuentas han sido minteadas y guardadas.");
}

main().catch((error) => {
  console.error("❌ Error al mintear:", error);
  process.exit(1);
});
