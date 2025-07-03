import { useState, useRef } from "react";

export function CreateNFTDialog({ onMint, isMinting }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !description) return;
    await onMint(file, name, description);
    modalRef.current?.close();
  };

  return (
    <>
      <button className="open-modal-button" onClick={() => modalRef.current?.showModal()}>
        Create New NFT
      </button>

      <dialog ref={modalRef} className="nft-modal">
        <div className="modal-box">
          <h3 className="modal-title">Mint a New NFT</h3>
          <form onSubmit={handleSubmit} className="nft-form">
            <input
              type="text"
              placeholder="NFT Name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className="form-textarea"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <input
              type="file"
              className="form-file"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              required
            />
            <div className="form-actions">
              <button type="button" className="form-button cancel-button" onClick={() => modalRef.current?.close()}>
                Cancel
              </button>
              <button
                type="submit"
                className={`form-button submit-button ${isMinting ? "loading" : ""}`}
                disabled={isMinting}
              >
                Mint NFT
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
