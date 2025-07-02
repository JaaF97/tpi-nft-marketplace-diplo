const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiploToken", function () {
  let DiploToken, token, owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    DiploToken = await ethers.getContractFactory("DiploToken");
    token = await DiploToken.deploy();
  });

  it("Debe asignar el total del supply inicial al owner", async function () {
    const totalSupply = await token.totalSupply();
    const ownerBalance = await token.balanceOf(owner.address);
    console.log("Supply inicial:", ethers.formatUnits(totalSupply, 18));
    console.log("Balance del owner:", ethers.formatUnits(ownerBalance, 18));
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("Debe permitir que el owner mintee tokens", async function () {
    const amount = ethers.parseUnits("1000", 18);

    const balanceAntes = await token.balanceOf(addr1.address);
    console.log(
      "Balance antes del mint (addr1):",
      ethers.formatUnits(balanceAntes, 18)
    );

    await token.mint(addr1.address, amount);

    const balanceDespues = await token.balanceOf(addr1.address);
    console.log(
      "Balance después del mint (addr1):",
      ethers.formatUnits(balanceDespues, 18)
    );

    expect(balanceDespues).to.equal(balanceAntes + amount);
  });

  it("No debe permitir que otros usen mint", async function () {
    const amount = ethers.parseUnits("500", 18);

    const balanceAntes = await token.balanceOf(owner.address);
    console.log(
      "Balance del owner antes del intento no autorizado de mint:",
      ethers.formatUnits(balanceAntes, 18)
    );

    await expect(token.connect(addr1).mint(owner.address, amount)).to.be
      .reverted;

    const balanceDespues = await token.balanceOf(owner.address);
    console.log(
      "Balance del owner después del intento:",
      ethers.formatUnits(balanceDespues, 18)
    );

    expect(balanceDespues).to.equal(balanceAntes);
  });

  // Nuevo test para completar la actividad: "Probar transferencias"
  it("Debe permitir transferencias entre cuentas", async function () {
    const transferAmount = ethers.parseUnits("500", 18);

    // Owner transfiere tokens a addr1
    const ownerBalanceAntes = await token.balanceOf(owner.address);
    const addr1BalanceAntes = await token.balanceOf(addr1.address);

    console.log("\n--- ANTES DE LA TRANSFERENCIA ---");
    console.log("Balance owner:", ethers.formatUnits(ownerBalanceAntes, 18));
    console.log("Balance addr1:", ethers.formatUnits(addr1BalanceAntes, 18));

    await token.transfer(addr1.address, transferAmount);

    const ownerBalanceDespues = await token.balanceOf(owner.address);
    const addr1BalanceDespues = await token.balanceOf(addr1.address);

    console.log("\n--- DESPUÉS DE LA TRANSFERENCIA ---");
    console.log("Balance owner:", ethers.formatUnits(ownerBalanceDespues, 18));
    console.log("Balance addr1:", ethers.formatUnits(addr1BalanceDespues, 18));

    expect(ownerBalanceDespues).to.equal(ownerBalanceAntes - transferAmount);
    expect(addr1BalanceDespues).to.equal(addr1BalanceAntes + transferAmount);
  });

  // Test adicional para transferencias con approve/transferFrom
  it("Debe permitir transferencias con approve/transferFrom", async function () {
    const approveAmount = ethers.parseUnits("300", 18);
    const transferAmount = ethers.parseUnits("200", 18);

    // Owner aprueba que addr1 pueda gastar sus tokens
    await token.approve(addr1.address, approveAmount);

    const allowance = await token.allowance(owner.address, addr1.address);
    console.log("Allowance aprobado:", ethers.formatUnits(allowance, 18));

    // addr1 transfiere tokens del owner a addr2
    const ownerBalanceAntes = await token.balanceOf(owner.address);
    const addr2BalanceAntes = await token.balanceOf(addr2.address);

    console.log("\n--- ANTES DE TRANSFERFROM ---");
    console.log("Balance owner:", ethers.formatUnits(ownerBalanceAntes, 18));
    console.log("Balance addr2:", ethers.formatUnits(addr2BalanceAntes, 18));

    await token
      .connect(addr1)
      .transferFrom(owner.address, addr2.address, transferAmount);

    const ownerBalanceDespues = await token.balanceOf(owner.address);
    const addr2BalanceDespues = await token.balanceOf(addr2.address);

    console.log("\n--- DESPUÉS DE TRANSFERFROM ---");
    console.log("Balance owner:", ethers.formatUnits(ownerBalanceDespues, 18));
    console.log("Balance addr2:", ethers.formatUnits(addr2BalanceDespues, 18));

    expect(ownerBalanceDespues).to.equal(ownerBalanceAntes - transferAmount);
    expect(addr2BalanceDespues).to.equal(addr2BalanceAntes + transferAmount);
  });

  // Test para verificar información basica del token
  it("Debe tener la información correcta del token", async function () {
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();

    console.log("\n--- INFORMACIÓN DEL TOKEN ---");
    console.log("Nombre:", name);
    console.log("Símbolo:", symbol);
    console.log("Decimales:", decimals);
    console.log("Supply total:", ethers.formatUnits(totalSupply, 18));

    expect(name).to.equal("Diplo");
    expect(symbol).to.equal("DIP");
    expect(decimals).to.equal(18);
  });
});
