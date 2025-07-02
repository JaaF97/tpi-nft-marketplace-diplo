// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    IERC721 public nft;
    IERC20 public tokenERC20;

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public pendingWithdrawals;

    event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed buyer, uint256 indexed tokenId, uint256 price);
    event Withdrawal(address indexed seller, uint256 amount);

    constructor(address _nftAddress, address _erc20Address) Ownable(msg.sender) {
        require(_nftAddress != address(0), "NFT address invalida");
        require(_erc20Address != address(0), "ERC20 address invalida");
        nft = IERC721(_nftAddress);
        tokenERC20 = IERC20(_erc20Address);
    }

    function listNFT(uint256 tokenId, uint256 price) external {
        require(nft.ownerOf(tokenId) == msg.sender, "No sos el owner del NFT");
        require(price > 0, "Precio invalido");

        nft.transferFrom(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price
        });

        emit NFTListed(msg.sender, tokenId, price);
    }

    function buyNFT(uint256 tokenId) external {
        Listing memory item = listings[tokenId];
        require(item.price > 0, "NFT no esta listado");

        require(
            tokenERC20.transferFrom(msg.sender, address(this), item.price),
            "Transferencia ERC20 fallida"
        );

        pendingWithdrawals[item.seller] += item.price;

        nft.transferFrom(address(this), msg.sender, tokenId);
        emit NFTSold(msg.sender, tokenId, item.price);

        delete listings[tokenId];
    }

    function retirarGanancias() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No hay saldo para retirar");

        pendingWithdrawals[msg.sender] = 0;
        require(tokenERC20.transfer(msg.sender, amount), "Transferencia ERC20 fallida");

        emit Withdrawal(msg.sender, amount);
    }
}
