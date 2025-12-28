import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landing/LandingPage"; // fixed path
import ProductsPage from "./components/adds/ProductsPage"; // correct path
import PurchaseHistoryPage from "./components/stock/PurchaseHistoryPage"; // correct path
import StorePage from "./components/sells/SellsPage"; // correct path
import LoginPage from "./components/auth/LoginPage"; // correct path
import SignUpPage from "./components/auth/SignUpPage"; // correct path
import CreateUser from "./components/users/createUser"; // correct path
import Buy from "./components/buy/Buy"; // correct path
import Statistics from "./components/statistics/Statistics"; // correct path
import DebtsPage from "./components/debts/DebtsPage"; // correct path

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/adding-product" element={<ProductsPage />} />
        <Route path="/adding-products" element={<PurchaseHistoryPage />} />
        <Route path="/selling-product" element={<StorePage />} />
        <Route path="/users" element={<CreateUser />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />{" "}
        <Route path="/buy" element={<Buy />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/debts" element={<DebtsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
