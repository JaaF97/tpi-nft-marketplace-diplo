import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { Navbar } from "../navbar/Navbar";

export function Layout({ tokenBalance }) {
  return (
    <div className="app-container">
      <Header tokenBalance={tokenBalance} />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
