import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";

import { Header } from "./components/header/Header";
import { NFTCard } from "./components/nft/NFTCard";
import { CreateNFTDialog } from "./components/nft/CreateNFTDialog";
import { uploadToIPFS } from "./services/ipfs";
import {
  TOKEN_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ADDRESS,
  TOKEN_ABI,
  NFT_ABI,
  MARKETPLACE_ABI,
  WALLETCONNECT_PROJECT_ID,
  HARDHAT_NETWORK,
} from "./constants";


createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: {
      name: "NFT Marketplace",
      description: "My NFT Marketplace",
      url: "http://localhost:5173",
      icons: [],
    },
  }),
  chains: [HARDHAT_NETWORK],
  projectId: WALLETCONNECT_PROJECT_ID,
});

function App() {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [tokenBalance, setTokenBalance] = useState("0");
  const [myNfts, setMyNfts] = useState([]);
  const [marketListings, setMarketListings] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState(null);

  const getSigner = useCallback(async () => {
    if (!walletProvider) return null;
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  }, [walletProvider]);

  const fetchAllData = useCallback(async () => {
    if (!address || !walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);

    const tokenContract = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      provider
    );
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );

    // Obtener balance de tokens
    const balance = await tokenContract.balanceOf(address);
    setTokenBalance(ethers.formatEther(balance));

    // Obtener NFTs del usuario
    const nftBalance = await nftContract.balanceOf(address);
    const userNfts = [];
    for (let i = 0; i < Number(nftBalance); i++) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
      const tokenURI = await nftContract.tokenURI(tokenId);
      userNfts.push({ id: Number(tokenId), uri: tokenURI });
    }
    setMyNfts(userNfts);

    // Obtener listings activos del marketplace
    // Usar el evento NFTListed de tu contrato
    const filter = marketplaceContract.filters.NFTListed();
    const events = await marketplaceContract.queryFilter(filter);

    const activeListingsPromises = events.map(async (event) => {
      if (event.args) {
        const { seller, nftContract: eventNftContract, tokenId } = event.args;

        // Verificar que el evento es de nuestro contrato NFT
        if (eventNftContract.toLowerCase() !== NFT_ADDRESS.toLowerCase()) {
          return null;
        }

        // Obtener información del listing usando la función getListing
        const listingData = await marketplaceContract.getListing(
          NFT_ADDRESS,
          tokenId
        );

        // Verificar que el listing está activo
        if (listingData.active) {
          const tokenURI = await nftContract.tokenURI(tokenId);
          return {
            tokenId: Number(tokenId),
            price: listingData.price,
            seller: listingData.seller,
            uri: tokenURI,
          };
        }
      }
      return null;
    });

    const activeListings = (await Promise.all(activeListingsPromises)).filter(
      Boolean
    );
    setMarketListings(activeListings);
  }, [address, walletProvider, chainId]);

  useEffect(() => {
    if (isConnected) {
      fetchAllData();
    } else {
      setTokenBalance("0");
      setMyNfts([]);
      setMarketListings([]);
    }
  }, [isConnected, address, chainId, fetchAllData]);

  const handleMint = async (file, name, description) => {
    const signer = await getSigner();
    if (!signer) return;

    setLoadingMessage("Uploading to IPFS...");
    try {
      const ipfsCID = await uploadToIPFS(file, { name, description });

      setLoadingMessage("Waiting for transaction confirmation...");
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const tx = await nftContract.mint(ipfsCID);
      await tx.wait();

      alert("NFT Minted Successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleList = async (tokenId, price) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Listing NFT...");
    try {
      const priceInWei = ethers.parseEther(price);
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // Aprobar el marketplace para transferir el NFT
      const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approveTx.wait();

      // Listar el NFT usando la función listNFT de tu contrato
      const listTx = await marketplaceContract.listNFT(
        NFT_ADDRESS,
        tokenId,
        priceInWei
      );
      await listTx.wait();

      alert("NFT Listed!");
      await fetchAllData();
    } catch (error) {
      console.error("Listing failed:", error);
      alert("Listing Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleBuy = async (listing) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Processing purchase...");
    try {
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // Aprobar el marketplace para transferir tokens
      const approveTx = await tokenContract.approve(
        MARKETPLACE_ADDRESS,
        listing.price
      );
      await approveTx.wait();

      // Comprar el NFT usando la función buyNFT de tu contrato
      const buyTx = await marketplaceContract.buyNFT(
        NFT_ADDRESS,
        listing.tokenId
      );
      await buyTx.wait();

      alert("Purchase successful!");
      await fetchAllData();
    } catch (error) {
      console.error("Buying failed:", error);
      alert("Purchase Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleCancel = async (tokenId) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Cancelling listing...");
    try {
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );
      // Usar la función cancelListing de tu contrato
      const tx = await marketplaceContract.cancelListing(NFT_ADDRESS, tokenId);
      await tx.wait();
      alert("Listing cancelled!");
      await fetchAllData();
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Cancellation Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  return (
    <div className="app-container">
      <Header tokenBalance={tokenBalance} />

      {loadingMessage && (
        <div className="notification-center">
          <div className="notification">
            <div className="notification-content">
              <span className="loading-spinner"></span>
              <span>{loadingMessage}</span>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        {!isConnected ? (
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-message">
                <h1 className="title-large">Welcome!</h1>
                <p className="description">
                  Connect your wallet to manage your NFTs and explore the
                  marketplace.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="section">
              <h2 className="section-title">Actions</h2>
              <div className="action-buttons">
                <CreateNFTDialog
                  onMint={handleMint}
                  isMinting={!!loadingMessage}
                />
                <button
                  className="button"
                  onClick={fetchAllData}
                  disabled={!!loadingMessage}
                >
                  Refresh Data
                </button>
              </div>
            </section>

            <section className="section">
              <h2 className="section-title">My NFTs</h2>
              {myNfts.length > 0 ? (
                <div className="nft-grid">
                  {myNfts.map((nft) => {
                    const listing = marketListings.find(
                      (l) => l.tokenId === nft.id
                    );
                    return (
                      <NFTCard
                        key={nft.id}
                        nft={nft}
                        isOwned={true}
                        isListed={!!listing}
                        listingPrice={listing?.price}
                        onList={handleList}
                        onBuy={handleBuy}
                        onCancel={handleCancel}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="empty-message">
                  You do not own any NFTs from this collection.
                </p>
              )}
            </section>

            <section className="section">
              <h2 className="section-title">Marketplace</h2>
              {marketListings.length > 0 ? (
                <div className="nft-grid">
                  {marketListings.map((listing) => {
                    if (listing.seller.toLowerCase() === address?.toLowerCase())
                      return null;
                    return (
                      <NFTCard
                        key={listing.tokenId}
                        nft={{ id: listing.tokenId, uri: listing.uri }}
                        isOwned={false}
                        isListed={true}
                        listingPrice={listing.price}
                        onList={() => Promise.resolve()}
                        onBuy={(nftToBuy) =>
                          handleBuy({ ...nftToBuy, price: listing.price })
                        }
                        onCancel={() => Promise.resolve()}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="empty-message">
                  There are no NFTs for sale right now.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
