import { useWeb3Modal } from "@web3modal/ethers/react";

export function ConnectWallet() {
  const { open } = useWeb3Modal();

  return (
    <div className="welcome-section">
      <div className="welcome-content">
        <div className="welcome-message">
          <h1 className="title-large">Bienvenido a Trinity NFT Marketplace</h1>
          <p className="description">
            Conecta tu billetera para empezar a crear, comprar y vender NFTs en
            nuestro marketplace
          </p>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span>Crea y mintea tus propios NFTs</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span>Compra y vende NFTs con DIP</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Transacciones seguras por blockchain</span>
            </div>
          </div>
          <button onClick={() => open()} className="connect-button large">
            Conecta tu billetera
          </button>
        </div>
      </div>
    </div>
  );
}
