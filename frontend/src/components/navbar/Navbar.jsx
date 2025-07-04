import { NavLink } from "react-router-dom";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

export function Navbar() {
  const { isConnected } = useWeb3ModalAccount();

  if (!isConnected) return null;

  return (
    <nav className="navbar-secondary">
      <div className="nav-links">
        <NavLink
          to="/my-nfts"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Mis NFTs
        </NavLink>
        <NavLink
          to="/marketplace"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Marketplace
        </NavLink>
      </div>
    </nav>
  );
}
