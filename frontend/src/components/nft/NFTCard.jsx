import { useState } from "react";
import { ethers } from "ethers";
import { useNftMetadata } from "../../hooks/useNftMetadata";
import { LoadingSteps } from "./LoadingSteps";

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
  const [loadingState, setLoadingState] = useState(null);
  const { metadata, isLoading: isMetadataLoading } = useNftMetadata(nft.uri);

  const handleListSubmit = async (e) => {
    e.preventDefault();
    setLoadingState({
      action: "listing",
      steps: [
        { label: "Aprobando NFT...", completed: false },
        { label: "Publicando en marketplace...", completed: false },
        { label: "Transacción confirmada", completed: false },
      ],
      currentStep: 0,
    });

    try {
      await onList(nft.id, price, (step) => {
        setLoadingState((prev) => ({
          ...prev,
          steps: prev.steps.map((s, i) =>
            i <= step ? { ...s, completed: true } : s
          ),
          currentStep: step + 1,
        }));
      });
      setPrice("");
    } catch (error) {
      console.error("La publicación del NFT falló:", error);
    } finally {
      setTimeout(() => setLoadingState(null), 2000);
    }
  };

  const handleBuyClick = async () => {
    setLoadingState({
      action: "buying",
      steps: [
        { label: "Aprobando tokens...", completed: false },
        { label: "Procesando compra...", completed: false },
        { label: "Transferencia completada", completed: false },
      ],
      currentStep: 0,
    });

    try {
      await onBuy(
        {
          tokenId: nft.id,
          uri: nft.uri,
          price: listingPrice,
          seller: "",
        },
        (step) => {
          setLoadingState((prev) => ({
            ...prev,
            steps: prev.steps.map((s, i) =>
              i <= step ? { ...s, completed: true } : s
            ),
            currentStep: step + 1,
          }));
        }
      );
    } catch (error) {
      console.error("Compra del NFT falló:", error);
    } finally {
      setTimeout(() => setLoadingState(null), 2000);
    }
  };

  const handleCancelClick = async () => {
    setLoadingState({
      action: "cancelling",
      steps: [
        { label: "Cancelando publicación...", completed: false },
        { label: "Transacción confirmada", completed: false },
      ],
      currentStep: 0,
    });

    try {
      await onCancel(nft.id, (step) => {
        setLoadingState((prev) => ({
          ...prev,
          steps: prev.steps.map((s, i) =>
            i <= step ? { ...s, completed: true } : s
          ),
          currentStep: step + 1,
        }));
      });
    } catch (error) {
      console.error("La cancelación de publicación falló:", error);
    } finally {
      setTimeout(() => setLoadingState(null), 2000);
    }
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
      {loadingState && (
        <LoadingSteps
          steps={loadingState.steps}
          currentStep={loadingState.currentStep}
          action={loadingState.action}
        />
      )}

      <figure className="nft-image-wrapper">
        {isMetadataLoading ? (
          <div className="skeleton-image"></div>
        ) : (
          metadata?.image && (
            <img
              src={metadata.image || "/placeholder.svg"}
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
                placeholder="Precio en DIP"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={!!loadingState}
              />
              <button
                type="submit"
                className={`form-button list-button ${
                  loadingState ? "loading" : ""
                }`}
                disabled={!!loadingState}
              >
                Poner en venta
              </button>
            </form>
          )}

          {isOwned && isListed && (
            <button
              onClick={handleCancelClick}
              className={`form-button cancel-button ${
                loadingState ? "loading" : ""
              }`}
              disabled={!!loadingState}
            >
              Cancelar publicación
            </button>
          )}

          {!isOwned && isListed && (
            <button
              onClick={handleBuyClick}
              className={`form-button buy-button ${
                loadingState ? "loading" : ""
              }`}
              disabled={!!loadingState}
            >
              Comprar NFT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
