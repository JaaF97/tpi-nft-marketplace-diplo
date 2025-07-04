import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { NFTCard } from "../components/nft/NFTCard";
import {
  TOKEN_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ADDRESS,
  TOKEN_ABI,
  NFT_ABI,
  MARKETPLACE_ABI,
} from "../constants";

export function Marketplace({ onTokenBalanceUpdate }) {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [marketListings, setMarketListings] = useState([]);

  const getSigner = useCallback(async () => {
    if (!walletProvider) return null;
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  }, [walletProvider]);

  const fetchMarketplace = useCallback(async () => {
    if (!address || !walletProvider) return;

    const provider = new ethers.BrowserProvider(walletProvider);
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );

    try {
      const filter = marketplaceContract.filters.NFTListed();
      const events = await marketplaceContract.queryFilter(filter);
      const activeListingsPromises = events.map(async (event) => {
        if (event.args) {
          const { seller, nftContract: eventNftContract, tokenId } = event.args;
          if (eventNftContract.toLowerCase() !== NFT_ADDRESS.toLowerCase()) {
            return null;
          }
          const listingData = await marketplaceContract.getListing(
            NFT_ADDRESS,
            tokenId
          );
          if (
            listingData.active &&
            seller.toLowerCase() !== address?.toLowerCase()
          ) {
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

      // Update token balance
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        provider
      );
      const balance = await tokenContract.balanceOf(address);
      onTokenBalanceUpdate(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching marketplace:", error);
    }
  }, [address, walletProvider, onTokenBalanceUpdate]);

  useEffect(() => {
    if (isConnected) {
      fetchMarketplace();
    }
  }, [isConnected, fetchMarketplace]);

  const handleBuy = async (listing, onProgress) => {
    const signer = await getSigner();
    if (!signer) return;

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

      onProgress(0); // Approving tokens
      const approveTx = await tokenContract.approve(
        MARKETPLACE_ADDRESS,
        listing.price
      );
      await approveTx.wait();

      onProgress(1); // Processing purchase
      const buyTx = await marketplaceContract.buyNFT(
        NFT_ADDRESS,
        listing.tokenId
      );
      await buyTx.wait();

      onProgress(2); // Transfer completed
      await fetchMarketplace();
    } catch (error) {
      console.error("Buying failed:", error);
      throw error;
    }
  };

  if (!isConnected) {
    return (
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-message">
            <h1 className="title-large">Conecta tu billetera</h1>
            <p className="description">
              Conecta tu billetera para navegar por el marketplace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Marketplace</h2>
        <button className="button" onClick={fetchMarketplace}>
          Actualizar marketplace
        </button>
      </div>

      {marketListings.length > 0 ? (
        <div className="nft-grid">
          {marketListings.map((listing) => (
            <NFTCard
              key={listing.tokenId}
              nft={{ id: listing.tokenId, uri: listing.uri }}
              isOwned={false}
              isListed={true}
              listingPrice={listing.price}
              onList={() => Promise.resolve()}
              onBuy={handleBuy}
              onCancel={() => Promise.resolve()}
            />
          ))}
        </div>
      ) : (
        <p className="empty-message">No hay NFTs a la venta.</p>
      )}
    </section>
  );
}
