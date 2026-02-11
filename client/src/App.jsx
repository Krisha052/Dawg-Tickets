import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Listings from "./pages/Listings.jsx";
import CreateListing from "./pages/CreateListing.jsx";
import Trades from "./pages/Trades.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/listings">Listings</Link>
        <Link to="/create-listing">Create Listing</Link>
        <Link to="/trades">My Trades</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Listings />} />
      </Routes>
    </div>
  );
}
