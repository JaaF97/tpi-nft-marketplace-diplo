// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrinityNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId = 1;
    
    constructor() ERC721("TrinityNFT", "TrNFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint NFT con IPFS hash
     * @param to Dirección que recibira el NFT
     * @param ipfsHash Hash IPFS del metadata
     */
    function mint(address to, string memory ipfsHash) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
    }
    
    // Mapping para almacenar URIs
    mapping(uint256 => string) private _tokenURIs;
    
    function _setTokenURI(uint256 tokenId, string memory ipfsHash) internal {
        _tokenURIs[tokenId] = string(abi.encodePacked("https://gateway.pinata.cloud/ipfs/", ipfsHash));
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token no existe");
        return _tokenURIs[tokenId];
    }
}