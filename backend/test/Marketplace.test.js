const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let owner, seller, buyer;
  let nft, token, marketplace;

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners();

    const DiploToken = await ethers.getContractFactory("DiploToken");
    token = await DiploToken.connect(owner).deploy();

    const TrinityNFT = await ethers.getContractFactory("TrinityNFT");
    nft = await TrinityNFT.connect(owner).deploy();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.connect(owner).deploy(
      nft.target,
      token.target
    );

    // Mint NFT y tokens
    await nft.connect(owner).mint(seller.address, "QmFakeMetadataCID");
    await token
      .connect(owner)
      .mint(buyer.address, ethers.parseUnits("1000", 18));

    await nft.connect(seller).approve(marketplace.target, 1);
    await token
      .connect(buyer)
      .approve(marketplace.target, ethers.parseUnits("1000", 18));
  });

  it("Permite listar y comprar un NFT", async () => {
    console.log("\n--- LISTADO DEL NFT ---");
    const price = ethers.parseUnits("500", 18);
    await marketplace.connect(seller).listNFT(1, price);
    const listing = await marketplace.listings(1);
    console.log("NFT listado por:", listing.seller);
    console.log(
      "Precio del NFT:",
      ethers.formatUnits(listing.price, 18),
      "DIP"
    );

    console.log("\n--- COMPRA DEL NFT ---");
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

    await marketplace.connect(buyer).buyNFT(1);

    const buyerNFT = await nft.ownerOf(1);
    expect(buyerNFT).to.equal(buyer.address);

    const ganancias = await marketplace.pendingWithdrawals(seller.address);
    console.log(
      "Ganancias pendientes del seller:",
      ethers.formatUnits(ganancias, 18),
      "DIP"
    );
  });

  it("Permite retirar ganancias", async () => {
    console.log("\n--- RETIRO DE GANANCIAS ---");
    const price = ethers.parseUnits("300", 18);
    await marketplace.connect(seller).listNFT(1, price);
    await marketplace.connect(buyer).buyNFT(1);

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
