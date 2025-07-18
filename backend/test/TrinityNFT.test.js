const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrinityNFTCollection", function () {
  let trinityNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TrinityNFT = await ethers.getContractFactory("TrinityNFTCollection");
    trinityNFT = await TrinityNFT.deploy();
    await trinityNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Debe establecer el nombre correcto", async function () {
      expect(await trinityNFT.name()).to.equal("TrinityNFT");
    });

    it("Debe establecer el símbolo correcto", async function () {
      expect(await trinityNFT.symbol()).to.equal("TRINFT");
    });

    it("Debe inicializar con totalSupply = 0", async function () {
      expect(await trinityNFT.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    const testIPFSHash = "QmTestHash123456789";

    it("Debe permitir que cualquier usuario mintee NFTs", async function () {
      await trinityNFT.connect(addr1).mint(testIPFSHash);

      expect(await trinityNFT.totalSupply()).to.equal(1);
      expect(await trinityNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await trinityNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Debe establecer el tokenURI correctamente", async function () {
      await trinityNFT.connect(addr1).mint(testIPFSHash);

      const expectedURI = `https://gateway.pinata.cloud/ipfs/${testIPFSHash}`;
      expect(await trinityNFT.tokenURI(1)).to.equal(expectedURI);
    });

    it("Debe incrementar el tokenId automáticamente", async function () {
      await trinityNFT.connect(addr1).mint(testIPFSHash);
      await trinityNFT.connect(addr2).mint("QmAnotherHash");

      expect(await trinityNFT.totalSupply()).to.equal(2);
      expect(await trinityNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await trinityNFT.ownerOf(2)).to.equal(addr2.address);
    });

    it("Debe fallar al consultar tokenURI de un token inexistente", async function () {
      await expect(trinityNFT.tokenURI(999)).to.be.revertedWithCustomError(
        trinityNFT,
        "ERC721NonexistentToken"
      );
    });
  });

  describe("Enumerable functionality", function () {
    const testIPFSHash1 = "QmTestHash1";
    const testIPFSHash2 = "QmTestHash2";

    beforeEach(async function () {
      await trinityNFT.connect(addr1).mint(testIPFSHash1);
      await trinityNFT.connect(addr1).mint(testIPFSHash2);
    });

    it("Debe permitir consultar token por índice", async function () {
      expect(await trinityNFT.tokenByIndex(0)).to.equal(1);
      expect(await trinityNFT.tokenByIndex(1)).to.equal(2);
    });

    it("Debe permitir consultar token del owner por índice", async function () {
      expect(await trinityNFT.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(
        1
      );
      expect(await trinityNFT.tokenOfOwnerByIndex(addr1.address, 1)).to.equal(
        2
      );
    });

    it("Debe mantener el supply correcto", async function () {
      expect(await trinityNFT.totalSupply()).to.equal(2);
    });
  });

  describe("Transfer functionality", function () {
    const testIPFSHash = "QmTestTransferHash";

    beforeEach(async function () {
      await trinityNFT.connect(addr1).mint(testIPFSHash);
    });

    it("Debe permitir transferir NFTs", async function () {
      await trinityNFT
        .connect(addr1)
        .transferFrom(addr1.address, addr2.address, 1);

      expect(await trinityNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await trinityNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await trinityNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("NO debe permitir transferir NFTs sin autorización", async function () {
      await expect(
        trinityNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWithCustomError(trinityNFT, "ERC721InsufficientApproval");
    });
  });
});
