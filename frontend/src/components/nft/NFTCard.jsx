import { useState } from "react";
import { ethers } from "ethers";
import { useNftMetadata } from "../../hooks/useNftMetadata";
import "../../App.css"
export function NFTCard({
  nft,
  isOwned,
  isListed,
  listingPrice,
  onList,
  onBuy,
  onCancel,
}) {
  const [price, setPrice] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { metadata, isLoading: isMetadataLoading } = useNftMetadata(nft.uri);

  const handleListSubmit = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    await onList(nft.id, price);
    setIsActionLoading(false);
  };

  const handleBuyClick = async () => {
    setIsActionLoading(true);
    await onBuy({
      tokenId: nft.id, 
      uri: nft.uri,
      price: listingPrice,
      seller: "",
    });
    setIsActionLoading(false);
  };

  const handleCancelClick = async () => {
    setIsActionLoading(true);
    await onCancel(nft.id);
    setIsActionLoading(false);
  };

  const renderCardContent = () => {
    if (isMetadataLoading) {
      return (
        <>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </>
      );
    }

    if (metadata) {
      return (
        <>
          <h2 className="nft-title">{metadata.name}</h2>
          <p className="nft-description">{metadata.description}</p>
        </>
      );
    }

    return <h2 className="nft-title">NFT #{nft.id}</h2>;
  };

  return (
    <div className="nft-card">
      <figure className="nft-image-wrapper">
        {isMetadataLoading ? (
          <div className="skeleton-image"></div>
        ) : (
          metadata?.image && (
            <img
              src={metadata.image}
              alt={metadata.name}
              className="nft-image"
            />
          )
        )}
      </figure>

      <div className="nft-card-body">
        <div className="nft-content">{renderCardContent()}</div>

        {isListed && listingPrice && (
          <div className="nft-price-badge">
            {ethers.formatEther(listingPrice)} DIP
          </div>
        )}

        <div className="nft-actions">
          {isOwned && !isListed && (
            <form onSubmit={handleListSubmit} className="nft-form">
              <input
                type="text"
                placeholder="Price in DIP"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`form-button list-button ${
                  isActionLoading ? "loading" : ""
                }`}
                disabled={isActionLoading}
              >
                List for Sale
              </button>
            </form>
          )}
          {isOwned && isListed && (
            <button
              onClick={handleCancelClick}
              className={`form-button cancel-button ${
                isActionLoading ? "loading" : ""
              }`}
              disabled={isActionLoading}
            >
              Cancel Listing
            </button>
          )}
          {!isOwned && isListed && (
            <button
              onClick={handleBuyClick}
              className={`form-button buy-button ${
                isActionLoading ? "loading" : ""
              }`}
              disabled={isActionLoading}
            >
              Buy NFT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
