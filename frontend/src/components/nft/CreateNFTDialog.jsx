import { useState, useRef } from "react";
import { LoadingSteps } from "./LoadingSteps";

export function CreateNFTDialog({ onMint }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loadingState, setLoadingState] = useState(null);
  const modalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !description) return;

    setLoadingState({
      action: "minting",
      steps: [
        { label: "Subiendo a IPFS...", completed: false },
        { label: "Minteando NFT...", completed: false },
        { label: "Transacción confirmada", completed: false },
      ],
      currentStep: 0,
    });

    try {
      await onMint(file, name, description, (step) => {
        setLoadingState((prev) => ({
          ...prev,
          steps: prev.steps.map((s, i) =>
            i <= step ? { ...s, completed: true } : s
          ),
          currentStep: step + 1,
        }));
      });

      // Reset form
      setFile(null);
      setName("");
      setDescription("");

      setTimeout(() => {
        setLoadingState(null);
        modalRef.current?.close();
      }, 2000);
    } catch (error) {
      console.error("Minting failed:", error);
      setLoadingState(null);
    }
  };

  return (
    <>
      <button
        className="open-modal-button"
        onClick={() => modalRef.current?.showModal()}
        disabled={!!loadingState}
      >
        Crear NFT
      </button>

      <dialog ref={modalRef} className="nft-modal">
        <div className="modal-box">
          {loadingState && (
            <LoadingSteps
              steps={loadingState.steps}
              currentStep={loadingState.currentStep}
              action={loadingState.action}
            />
          )}

          <h3 className="modal-title">Mint a New NFT</h3>
          <form onSubmit={handleSubmit} className="nft-form">
            <input
              type="text"
              placeholder="Nombre del NFT"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!!loadingState}
            />
            <textarea
              className="form-textarea"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={!!loadingState}
            ></textarea>
            <input
              type="file"
              className="form-file"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              required
              disabled={!!loadingState}
            />
            <div className="form-actions">
              <button
                type="button"
                className="form-button cancel-button"
                onClick={() => modalRef.current?.close()}
                disabled={!!loadingState}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`form-button submit-button ${
                  loadingState ? "loading" : ""
                }`}
                disabled={!!loadingState}
              >
                Crear NFT
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
