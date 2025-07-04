import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { Layout } from "./components/layout/Layout";
import { ConnectWallet } from "./pages/ConnectWallet";
import { MyNFTs } from "./pages/MyNFTs";
import { Marketplace } from "./pages/Marketplace";
import { WALLETCONNECT_PROJECT_ID, HARDHAT_NETWORK } from "./constants";
import "./App.css";

// Configurar Web3Modal
createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: {
      name: "Trinity NFT Marketplace",
      description: "Trinity NFT Marketplace",
      url: "http://localhost:5173",
      icons: [],
    },
  }),
  chains: [HARDHAT_NETWORK],
  projectId: WALLETCONNECT_PROJECT_ID,
});

function App() {
  const { isConnected } = useWeb3ModalAccount();
  const [tokenBalance, setTokenBalance] = useState("0");

  const handleTokenBalanceUpdate = (balance) => {
    setTokenBalance(balance);
  };

  // Reset token balance when disconnected
  useEffect(() => {
    if (!isConnected) {
      setTokenBalance("0");
    }
  }, [isConnected]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout tokenBalance={tokenBalance} />}>
          <Route
            index
            element={
              isConnected ? (
                <Navigate to="/my-nfts" replace />
              ) : (
                <ConnectWallet />
              )
            }
          />
          <Route
            path="my-nfts"
            element={
              isConnected ? (
                <MyNFTs onTokenBalanceUpdate={handleTokenBalanceUpdate} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="marketplace"
            element={
              isConnected ? (
                <Marketplace onTokenBalanceUpdate={handleTokenBalanceUpdate} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
