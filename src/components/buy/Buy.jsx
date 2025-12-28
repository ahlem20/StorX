import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FiArrowLeft, FiPlus, FiSave, FiSearch, FiBox } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import VirtualKeyboard from "../sells/VirtualKeyboard";
import "./buy.css";

const translations = {
  en: {
    title: "Restock Inventory",
    scanInstruction: "Scan product barcode",
    manualPlaceholder: "Or type barcode manually...",
    productInfo: "Product Info",
    currentStock: "Current Stock",
    afterAdd: "After Add",
    quantityToAdd: "Quantity to Add",
    enterAmount: "Enter amount...",
    confirmUpdate: "Confirm Update",
    clear: "Clear",
    noProduct: "No Product Selected",
    noProductDesc: "Scan a barcode or enter it manually to see product details and update stock.",
    back: "Back",
  },
  ar: {
    title: "تحديث المخزون",
    scanInstruction: "امسح باركود المنتج",
    manualPlaceholder: "أو أدخل الباركود يدويًا...",
    productInfo: "معلومات المنتج",
    currentStock: "المخزون الحالي",
    afterAdd: "بعد الإضافة",
    quantityToAdd: "الكمية للإضافة",
    enterAmount: "أدخل الكمية...",
    confirmUpdate: "تأكيد التحديث",
    clear: "مسح",
    noProduct: "لم يتم تحديد منتج",
    noProductDesc: "امسح الباركود أو أدخله يدويًا لعرض التفاصيل وتحديث المخزون.",
    back: "رجوع",
  },
  fr: {
    title: "Réapprovisionner",
    scanInstruction: "Scanner le code-barres",
    manualPlaceholder: "Ou saisir le code manuellement...",
    productInfo: "Info Produit",
    currentStock: "Stock Actuel",
    afterAdd: "Après Ajout",
    quantityToAdd: "Quantité à Ajouter",
    enterAmount: "Saisir quantité...",
    confirmUpdate: "Confirmer",
    clear: "Effacer",
    noProduct: "Aucun produit sélectionné",
    noProductDesc: "Scannez un code-barres ou saisissez-le pour voir les détails.",
    back: "Retour",
  },
};

export default function UpdateStock() {
  const navigate = useNavigate();
  const [lang] = useState(localStorage.getItem("lang") || "en");
  const t = translations[lang];

  const [scannedCode, setScannedCode] = useState("");
  const [product, setProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [storeProducts, setStoreProducts] = useState([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [focusedInput, setFocusedInput] = useState("manualBarcode"); // "manualBarcode" or "quantityToAdd"
  const isKbEnabled = localStorage.getItem("kbEnabled") !== "false";
  const handleKeyboardPress = (key) => {
    if (key === "Clear") {
      if (focusedInput === "manualBarcode") {
        setManualBarcode("");
        setScannedCode("");
      } else if (focusedInput === "quantityToAdd") {
        setQuantityToAdd("");
      }
      return;
    }
    if (key === "Backspace") {
      if (focusedInput === "manualBarcode") {
        setManualBarcode((prev) => prev.slice(0, -1));
        setScannedCode("");
      } else if (focusedInput === "quantityToAdd") {
        setQuantityToAdd((prev) => prev.toString().slice(0, -1));
      }
      return;
    }

    if (focusedInput === "manualBarcode") {
      setManualBarcode((prev) => prev + key);
      setScannedCode("");
    } else if (focusedInput === "quantityToAdd") {
      setQuantityToAdd((prev) => prev.toString() + key);
    }
  };

  useEffect(() => {
    const fetchStoreProducts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const storeId = user?.storeId;
        if (!storeId) throw new Error("No store assigned");

        const res = await fetch(`http://localhost:3500/products/products?storeId=${storeId}`);
        if (!res.ok) throw new Error("Failed to fetch store products");

        const data = await res.json();
        setStoreProducts(data);
      } catch (err) {
        alert("❌ " + err.message);
      }
    };

    fetchStoreProducts();
  }, []);

  // Handle barcode change (scanned or manual)
  useEffect(() => {
    const code = scannedCode || manualBarcode;
    if (!code) {
      setProduct(null);
      return;
    }
    const found = storeProducts.find((p) => p.barcode === code);
    if (found) {
      setProduct(found);
      setQuantityToAdd(""); // Reset quantity when product changes
    }
    else setProduct(null);
  }, [scannedCode, manualBarcode, storeProducts]);

  const handleQuickAdd = (amount) => {
    setQuantityToAdd((prev) => Number(prev || 0) + amount);
  };

  const handleUpdateStock = async () => {
    if (!product) return alert("Product not found");
    if (!quantityToAdd || Number(quantityToAdd) <= 0) return alert("Enter valid quantity");

    try {
      const newStock = Number(product.stock || 0) + Number(quantityToAdd);

      const res = await fetch(`http://localhost:3500/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update stock");

      alert(`✅ Stock updated! ${product.name} is now ${newStock}`);

      // Update local state
      setStoreProducts(prev => prev.map(p => p._id === product._id ? { ...p, stock: newStock } : p));
      setProduct(prev => ({ ...prev, stock: newStock }));
      setQuantityToAdd("");
      setScannedCode("");
      setManualBarcode("");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="buy-page">
      <div className="page-header">
        <div className="header-left">
          <div onClick={() => navigate("/")} className="back-button">
            <FiArrowLeft size={24} />
          </div>
          <h1>{t.title}</h1>
        </div>
      </div>

      <div className="buy-content">
        <div className="main-card">
          <div className="split-view">
            {/* Left Panel: Scanner & Search */}
            <div className="panel left-panel1">
              <div className="scanner-section">
                <div className="scanner-wrapper">
                  <Scanner
                    onDecode={(result) => setScannedCode(result)}
                    onError={(err) => console.error(err)}
                    constraints={{ facingMode: "environment" }}
                    containerStyle={{ width: "100%", height: "100%" }}
                    videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div className="scanner-line"></div>
                </div>
                <p className="scanner-instruction">{t.scanInstruction}</p>
              </div>

              <div className="manual-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t.manualPlaceholder}
                  value={manualBarcode}
                  readOnly={isKbEnabled}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onFocus={() => {
                    if (isKbEnabled) {
                      setFocusedInput("manualBarcode");
                      setShowKeyboard(true);
                    }
                  }}
                  className="search-input"
                />
              </div>
            </div>

            {/* Right Panel: Product Actions */}
            <div className="panel right-panel">
              {product ? (
                <div className="product-details-container">
                  <div className="product-header">
                    <div className="product-icon-large">
                      <FiBox />
                    </div>
                    <div className="product-title-group">
                      <h3>{product.name}</h3>
                      <span className="barcode-tag">{product.barcode}</span>
                    </div>
                  </div>

                  <div className="stock-comparison-grid">
                    <div className="stock-card current">
                      <span className="stock-label">{t.currentStock}</span>
                      <span className="stock-value">{product.stock}</span>
                    </div>
                    <div className="stock-arrow">→</div>
                    <div className="stock-card future">
                      <span className="stock-label">{t.afterAdd}</span>
                      <span className="stock-value highlight">
                        {Number(product.stock) + Number(quantityToAdd || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="action-area">
                    <label>{t.quantityToAdd}</label>
                    <div className="quantity-input-group">
                      <input
                        type="text"
                        value={quantityToAdd}
                        readOnly={isKbEnabled}
                        onChange={(e) => setQuantityToAdd(e.target.value)}
                        onFocus={() => {
                          if (isKbEnabled) {
                            setFocusedInput("quantityToAdd");
                            setShowKeyboard(true);
                          }
                        }}
                        placeholder={t.enterAmount}
                        className="quantity-input"
                      />
                      {quantityToAdd && (
                        <button onClick={() => setQuantityToAdd("")} className="clear-btns">
                          {t.clear}
                        </button>
                      )}
                    </div>

                    <div className="quick-add-grid">
                      {[1, 5, 10, 20, 50, 100].map((amt) => (
                        <button key={amt} onClick={() => handleQuickAdd(amt)} className="quick-btn">
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="confirm-btn" onClick={handleUpdateStock} disabled={!quantityToAdd}>
                    <FiSave /> {t.confirmUpdate}
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <FiBox size={48} />
                  </div>
                  <h3>{t.noProduct}</h3>
                  <p>{t.noProductDesc}</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
