import DiploTokenABI from "../abis/DiploToken.json";
import TrinityNFTABI from "../abis/TrinityNFTCollection.json";
import MarketplaceABI from "../abis/Marketplace.json";

// Direcciones de los contratos desplegados
export const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const MARKETPLACE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

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