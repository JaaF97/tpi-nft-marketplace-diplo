import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers/react";
import "../../App.css"
export function Header({ tokenBalance }) {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <a className="marketplace-title">DIP NFT Marketplace</a>
      </div>
      <div className="navbar-right">
        {isConnected && address ? (
          <div className="wallet-info">
            <div className="wallet-address">
              <p className="address-text">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </p>
              <p className="token-balance">
                {parseFloat(tokenBalance).toFixed(2)} DIP
              </p>
            </div>
            <button onClick={() => open({ view: "Account" })} className="account-button">
              Account
            </button>
          </div>
        ) : (
          <button onClick={() => open()} className="connect-button">
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;