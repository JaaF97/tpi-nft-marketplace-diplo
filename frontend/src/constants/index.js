import DiploTokenABI from "../abis/DiploToken.json";
import TrinityNFTABI from "../abis/TrinityNFTCollection.json";
import MarketplaceABI from "../abis/Marketplace.json";

// Direcciones de los contratos desplegados
export const TOKEN_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const NFT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const MARKETPLACE_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

// ABIs de los contratos
export const TOKEN_ABI = DiploTokenABI.abi;
export const NFT_ABI = TrinityNFTABI.abi;
export const MARKETPLACE_ABI = MarketplaceABI.abi;

// Web3Modal Project ID
export const WALLETCONNECT_PROJECT_ID = "5dbc753d2daf120173bd97643b0b80ae"; // Usa tu propio ID

// Configuración de la red Hardhat
export const HARDHAT_NETWORK = {
  chainId: 31337,
  name: "Hardhat",
  currency: "ETH",
  explorerUrl: "http://localhost:8545",
  rpcUrl: "http://127.0.0.1:8545",
};