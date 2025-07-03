const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const amount = ethers.parseUnits("1000", 18);
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("🔍 Información de debug:");
  console.log("Red actual:", hre.network.name);
  console.log("Contrato DIP:", tokenAddress);
  console.log("Destinatario:", recipient);
  
  try {
    // Verificar la conexión
    const [signer] = await ethers.getSigners();
    console.log("Firmante:", signer.address);
    
    // Verificar que el contrato existe
    const code = await ethers.provider.getCode(tokenAddress);
    if (code === "0x") {
      throw new Error("❌ El contrato no existe en esta red");
    }
    console.log("✅ Contrato encontrado");
    
    // Conectar al contrato
    const DiploToken = await ethers.getContractAt("DiploToken", tokenAddress);
    
    // Verificar información del contrato
    const name = await DiploToken.name();
    const symbol = await DiploToken.symbol();
    const owner = await DiploToken.owner();
    
    console.log("Nombre del token:", name);
    console.log("Símbolo:", symbol);
    console.log("Owner del contrato:", owner);
    console.log("¿Es el firmante el owner?", owner.toLowerCase() === signer.address.toLowerCase());
    
    // Verificar balance antes
    const balanceBefore = await DiploToken.balanceOf(recipient);
    console.log("Balance antes:", ethers.formatUnits(balanceBefore, 18), "DIP");
    
    // Mintear tokens
    console.log("🪙 Minteando tokens...");
    const tx = await DiploToken.mint(recipient, amount);
    console.log("Hash de transacción:", tx.hash);
    
    await tx.wait();
    console.log("✅ Transacción confirmada");
    
    // Verificar balance después
    const balanceAfter = await DiploToken.balanceOf(recipient);
    console.log("Balance después:", ethers.formatUnits(balanceAfter, 18), "DIP");
    
  } catch (error) {
    console.error("❌ Error detallado:", error.message);
    if (error.reason) {
      console.error("Razón:", error.reason);
    }
    if (error.data) {
      console.error("Data:", error.data);
    }
  }
}

main().catch((error) => {
  console.error("❌ Error al mintear DIP:", error);
  process.exit(1);
});