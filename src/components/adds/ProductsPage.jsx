import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBox, FiDollarSign, FiTag, FiFileText } from "react-icons/fi";
import { Scanner } from "@yudiel/react-qr-scanner";
import VirtualKeyboard from "../sells/VirtualKeyboard";
import "./ProductsPage.css";

const translations = {
  en: {
    title: "Add New Product",
    name: "Product Name",
    category: "Category",
    barcode: "Barcode",
    price: "Selling Price",
    costPrice: "Cost Price",
    stock: "Initial Stock",
    description: "Description",
    submit: "Create Product",
    back: "Back to Dashboard",
    scan: "Scan Barcode",
    scanning: "Scanning...",
  },
  ar: {
    title: "إضافة منتج جديد",
    name: "اسم المنتج",
    category: "الفئة",
    barcode: "الباركود",
    price: "سعر البيع",
    costPrice: "سعر التكلفة",
    stock: "المخزون الأولي",
    description: "الوصف",
    submit: "إنشاء المنتج",
    back: "العودة للوحة التحكم",
    scan: "مسح الباركود",
    scanning: "جاري المسح...",
  },
  fr: {
    title: "Ajouter un Produit",
    name: "Nom du Produit",
    category: "Catégorie",
    barcode: "Code-barres",
    price: "Prix de Vente",
    costPrice: "Prix de Revient",
    stock: "Stock Initial",
    description: "Description",
    submit: "Créer le Produit",
    back: "Retour au Tableau de Bord",
    scan: "Scanner Code-barres",
    scanning: "Scan en cours...",
  },
};

export default function ProductsPage() {
  const [lang] = useState(localStorage.getItem("lang") || "en");
  const [products, setProducts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const isKbEnabled = localStorage.getItem("kbEnabled") !== "false";

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storeId = storedUser?.storeId || "";

  const [form, setForm] = useState({
    storeId: storeId,
    name: "",
    category: "",
    barcode: "",
    price: "",
    costPrice: "",
    stock: "",
    description: "",
  });

  const t = translations[lang];
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:3500/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleKeyboardPress = (key) => {
    if (key === "Clear") {
      setForm((prev) => ({ ...prev, [focusedInput]: "" }));
      return;
    }
    if (key === "Backspace") {
      setForm((prev) => ({
        ...prev,
        [focusedInput]: prev[focusedInput]?.toString().slice(0, -1) || "",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [focusedInput]: (prev[focusedInput] || "").toString() + key,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.storeId) {
      setError("Store ID not found. Please log in again.");
      return;
    }

    if (!form.name || !form.price) {
      setError("Please fill in all required fields!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3500/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create product");
      }

      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      setSuccess("Product added successfully!");
      setForm((prev) => ({ ...prev, name: "", category: "", barcode: "", price: "", costPrice: "", stock: "", description: "" }));

      // Scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className={`products-page ${lang === "ar" ? "rtl" : ""}`}>
      {/* Back Button */}
      <div className="back-div" onClick={() => navigate("/")}>
        <FiArrowLeft size={20} className="back-icon" />
        <span>{t.back}</span>
      </div>

      <h1 className="page-title">{t.title}</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Product Form */}
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3><FiBox /> Product Details</h3>
          <div className="input-group-row">
            <div className="input-wrapper">
              <label>{t.name}</label>
              <input
                name="name"
                placeholder={t.name}
                value={form.name}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("name"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
                required
              />
            </div>
            <div className="input-wrapper">
              <label>{t.category}</label>
              <input
                name="category"
                placeholder={t.category}
                value={form.category}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("category"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-wrapper full-width">
              <label>{t.description}</label>
              <textarea
                name="description"
                placeholder={t.description}
                value={form.description}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("description"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><FiDollarSign /> Pricing & Stock</h3>
          <div className="input-group-row">
            <div className="input-wrapper">
              <label>{t.price}</label>
              <input
                type="text"
                name="price"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("price"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
                required
              />
            </div>
            <div className="input-wrapper">
              <label>{t.costPrice}</label>
              <input
                type="text"
                name="costPrice"
                placeholder="0.00"
                value={form.costPrice}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("costPrice"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
              />
            </div>
            <div className="input-wrapper">
              <label>{t.stock}</label>
              <input
                type="text"
                name="stock"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("stock"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><FiTag /> Barcode & Identification</h3>
          <div className="input-group-row">
            <div className="input-wrapper full-width">
              <input
                name="barcode"
                placeholder={t.barcode}
                value={form.barcode}
                onChange={handleChange}
                onFocus={() => { setFocusedInput("barcode"); if (isKbEnabled) setShowKeyboard(true); }}
                readOnly={isKbEnabled}
              />
            </div>
            <button type="button" onClick={() => setScanning(!scanning)} className={`scan-btn ${scanning ? 'active' : ''}`}>
              {scanning ? t.scanning : t.scan}
            </button>
          </div>

          {scanning && (
            <div className="scanner-container1">
              <Scanner
                onDecode={(result) => {
                  setForm((prev) => ({ ...prev, barcode: result }));
                  setScanning(false);
                }}
                onError={(err) => console.error(err)}
                constraints={{ facingMode: "environment" }}
              />
            </div>
          )}
        </div>

        <button className="submit-btn" type="submit">{t.submit}</button>
      </form>

      {/* Product List */}
      <div className="product-list">
        {products.map((p) => (
          <div className="product-card" key={p._id}>
            <h3>{p.name}</h3>
            <p><span>{t.category}:</span> {p.category}</p>
            <p><span>{t.price}:</span> {p.price}</p>
            <p><span>{t.stock}:</span> {p.stock}</p>
          </div>
        ))}
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyboardPress}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
}
