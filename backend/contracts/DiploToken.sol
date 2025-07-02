// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DiploToken is ERC20, Ownable {
    constructor() ERC20("Diplo", "DIP") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    // Función mint para testing (solo el owner puede mintear)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

