import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { NFTCard } from "../components/nft/NFTCard";
import { CreateNFTDialog } from "../components/nft/CreateNFTDialog";
import { uploadToIPFS } from "../services/ipfs";
import {
  TOKEN_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ADDRESS,
  TOKEN_ABI,
  NFT_ABI,
  MARKETPLACE_ABI,
} from "../constants";

export function MyNFTs({ onTokenBalanceUpdate }) {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [myNfts, setMyNfts] = useState([]);
  const [marketListings, setMarketListings] = useState([]);

  const getSigner = useCallback(async () => {
    if (!walletProvider) return null;
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  }, [walletProvider]);

  const fetchMyNFTs = useCallback(async () => {
    if (!address || !walletProvider) return;

    const provider = new ethers.BrowserProvider(walletProvider);
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );

    try {
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
          if (listingData.active) {
            return {
              tokenId: Number(tokenId),
              price: listingData.price,
              seller: listingData.seller,
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
      console.error("Error fetching NFTs:", error);
    }
  }, [address, walletProvider, onTokenBalanceUpdate]);

  useEffect(() => {
    if (isConnected) {
      fetchMyNFTs();
    }
  }, [isConnected, fetchMyNFTs]);

  const handleMint = async (file, name, description, onProgress) => {
    const signer = await getSigner();
    if (!signer) return;

    try {
      onProgress(0); // Uploading to IPFS
      const ipfsCID = await uploadToIPFS(file, { name, description });

      onProgress(1); // Minting NFT
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const tx = await nftContract.mint(ipfsCID);
      await tx.wait();

      onProgress(2); // Transaction confirmed
      await fetchMyNFTs();
    } catch (error) {
      console.error("Minting failed:", error);
      throw error;
    }
  };

  const handleList = async (tokenId, price, onProgress) => {
    const signer = await getSigner();
    if (!signer) return;

    try {
      const priceInWei = ethers.parseEther(price);
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      onProgress(0); // Approving NFT
      const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approveTx.wait();

      onProgress(1); // Listing on marketplace
      const listTx = await marketplaceContract.listNFT(
        NFT_ADDRESS,
        tokenId,
        priceInWei
      );
      await listTx.wait();

      onProgress(2); // Transaction confirmed
      await fetchMyNFTs();
    } catch (error) {
      console.error("Listing failed:", error);
      throw error;
    }
  };

  const handleCancel = async (tokenId, onProgress) => {
    const signer = await getSigner();
    if (!signer) return;

    try {
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      onProgress(0); // Cancelling listing
      const tx = await marketplaceContract.cancelListing(NFT_ADDRESS, tokenId);
      await tx.wait();

      onProgress(1); // Transaction confirmed
      await fetchMyNFTs();
    } catch (error) {
      console.error("Cancellation failed:", error);
      throw error;
    }
  };

  if (!isConnected) {
    return (
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-message">
            <h1 className="title-large">Conectar billetera</h1>
            <p className="description">
              Por favor, conecta tu billetera para ver y administrar tus NFTs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="section">
        <h2 className="section-title">Crear NFT</h2>
        <div className="action-buttons">
          <CreateNFTDialog onMint={handleMint} />
          <button className="button" onClick={fetchMyNFTs}>
            Actualizar
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Mis NFTs</h2>
        {myNfts.length > 0 ? (
          <div className="nft-grid">
            {myNfts.map((nft) => {
              const listing = marketListings.find((l) => l.tokenId === nft.id);
              return (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  isOwned={true}
                  isListed={!!listing}
                  listingPrice={listing?.price}
                  onList={handleList}
                  onBuy={() => Promise.resolve()}
                  onCancel={handleCancel}
                />
              );
            })}
          </div>
        ) : (
          <p className="empty-message">
            No posees ningún NFT de esta colección.
          </p>
        )}
      </section>
    </>
  );
}
