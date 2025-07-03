const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let owner, seller, buyer;
  let nft, token, marketplace;

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners();

    const DiploToken = await ethers.getContractFactory("DiploToken");
    const initialSupply = ethers.parseEther("1000000");
    token = await DiploToken.connect(owner).deploy(initialSupply);

    const TrinityNFT = await ethers.getContractFactory("TrinityNFTCollection");
    nft = await TrinityNFT.connect(owner).deploy();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.connect(owner).deploy(token.target);

    await nft.connect(seller).mint("QmFakeMetadataCID");

    // Owner le da tokens al buyer
    await token
      .connect(owner)
      .transfer(buyer.address, ethers.parseEther("1000"));

    // Aprobar marketplace para transferencias
    await nft.connect(seller).approve(marketplace.target, 1);
    await token
      .connect(buyer)
      .approve(marketplace.target, ethers.parseEther("1000"));
  });

  it("Permite listar y comprar un NFT", async () => {
    console.log("\n--- LISTADO DEL NFT ---");
    const price = ethers.parseEther("500");
    await marketplace.connect(seller).listNFT(nft.target, 1, price);

    const listing = await marketplace.listings(nft.target, 1);
    console.log("NFT listado por:", listing.seller);
    console.log(
      "Precio del NFT:",
      ethers.formatUnits(listing.price, 18),
      "DIP"
    );

    console.log("\n--- COMPRA DEL NFT ---");

    // Vendedor prefiere pago diferido (para que aparezca en pendingWithdrawals)
    await marketplace.connect(seller).setPaymentPreference(true);

    const sellerBalanceAntes = await token.balanceOf(seller.address);
    const buyerBalanceAntes = await token.balanceOf(buyer.address);
    console.log(
      "Balance seller antes:",
      ethers.formatUnits(sellerBalanceAntes, 18)
    );
    console.log(
      "Balance buyer antes:",
      ethers.formatUnits(buyerBalanceAntes, 18)
    );

    // Buyer compra
    await marketplace.connect(buyer).buyNFT(nft.target, 1);

    const buyerNFT = await nft.ownerOf(1);
    expect(buyerNFT).to.equal(buyer.address);

    const ganancias = await marketplace.pendingWithdrawals(seller.address);
    console.log(
      "Ganancias pendientes del seller:",
      ethers.formatUnits(ganancias, 18),
      "DIP"
    );

    expect(ganancias).to.equal(price);
  });

  it("Permite retirar ganancias", async () => {
    console.log("\n--- RETIRO DE GANANCIAS ---");
    const price = ethers.parseEther("300");

    // Vendedor prefiere cobro diferido
    await marketplace.connect(seller).setPaymentPreference(true);

    await marketplace.connect(seller).listNFT(nft.target, 1, price);
    await marketplace.connect(buyer).buyNFT(nft.target, 1);

    const saldoAntes = await token.balanceOf(seller.address);
    console.log(
      "Saldo seller antes de retirar:",
      ethers.formatUnits(saldoAntes, 18)
    );

    await marketplace.connect(seller).retirarGanancias();

    const saldoDespues = await token.balanceOf(seller.address);
    console.log(
      "Saldo seller después de retirar:",
      ethers.formatUnits(saldoDespues, 18)
    );

    expect(saldoDespues).to.be.gt(saldoAntes);
  });
});
