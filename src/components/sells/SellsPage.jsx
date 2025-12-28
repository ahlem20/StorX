import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FiArrowLeft, FiDelete, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "./SellsPage.css";
import NumericKeypad from "./NumericKeypad";
import VirtualKeyboard from "./VirtualKeyboard";
const translations = {
  en: {
    title: "📦 Sell Products",
    back: "Back",

    // Scanner & Form
    scannedBarcode: "Scanned Barcode:",
    barcode: "Product Barcode",
    quantity: "Quantity",
    customPrice: "Custom Selling Price",
    customPricePlaceholder: "Optional price",
    addToCart: "Add to Cart",
    submit: "Sell All Products",

    // Search
    scanPlaceholder: "Scan or enter barcode",
    searchPlaceholder: "Search by name or barcode...",
    searchTitle: "Search Product",

    // Cart
    cart: "Cart",
    items: "items",
    noProducts: "No products added yet.",
    total: "Total",
    remove: "Remove",
    edit: "Edit",

    // Alerts / Messages
    cartEmpty: "Cart is empty!",
    barcodeQtyRequired: "Barcode and quantity required!",
    productNotFound: "Product not found in store",
    soldSuccess: "✅ All products sold!",
    sellFailed: "❌ Failed to sell products",

    // Invoice
    invoice: "INVOICE",
    date: "Date",
    from: "From",
    item: "Item",
    price: "Price",
    amount: "Amount",
    paymentMethod: "Payment method",
    cash: "Cash",
    debt: "Debt",
    clientName: "Client Name",
    clientNamePlaceholder: "Enter client name...",
    note: "Note",
    thankYou: "Thank you for choosing us!",
  },

  ar: {
    title: "📦 بيع المنتجات",
    back: "رجوع",

    scannedBarcode: "الباركود الممسوح:",
    barcode: "باركود المنتج",
    quantity: "الكمية",
    customPrice: "سعر البيع المخصص",
    customPricePlaceholder: "سعر اختياري",
    addToCart: "أضف إلى السلة",
    submit: "بيع جميع المنتجات",

    scanPlaceholder: "امسح أو أدخل الباركود",
    searchPlaceholder: "ابحث بالاسم أو الباركود...",
    searchTitle: "البحث عن منتج",

    cart: "السلة",
    items: "عناصر",
    noProducts: "لم يتم إضافة أي منتجات بعد",
    total: "المجموع",
    remove: "حذف",
    edit: "تعديل",

    cartEmpty: "السلة فارغة!",
    barcodeQtyRequired: "الباركود والكمية مطلوبان!",
    productNotFound: "المنتج غير موجود في المتجر",
    soldSuccess: "✅ تم بيع جميع المنتجات!",
    sellFailed: "❌ فشل في بيع المنتجات",

    invoice: "فاتورة",
    date: "التاريخ",
    from: "من",
    item: "المنتج",
    price: "السعر",
    amount: "الإجمالي",
    paymentMethod: "طريقة الدفع",
    cash: "نقداً",
    debt: "دين",
    clientName: "اسم العميل",
    clientNamePlaceholder: "أدخل اسم العميل...",
    note: "ملاحظة",
    thankYou: "شكراً لاختياركم لنا!",
  },

  fr: {
    title: "📦 Vendre des produits",
    back: "Retour",

    scannedBarcode: "Code-barres scanné :",
    barcode: "Code-barres du produit",
    quantity: "Quantité",
    customPrice: "Prix de vente personnalisé",
    customPricePlaceholder: "Prix optionnel",
    addToCart: "Ajouter au panier",
    submit: "Vendre tous les produits",

    scanPlaceholder: "Scanner ou entrer le code-barres",
    searchPlaceholder: "Rechercher par nom ou code-barres...",
    searchTitle: "Rechercher un produit",

    cart: "Panier",
    items: "articles",
    noProducts: "Aucun produit ajouté pour le moment",
    total: "Total",
    remove: "Supprimer",
    edit: "Modifier",

    cartEmpty: "Le panier est vide !",
    barcodeQtyRequired: "Code-barres et quantité requis !",
    productNotFound: "Produit introuvable dans le magasin",
    soldSuccess: "✅ Tous les produits ont été vendus !",
    sellFailed: "❌ Échec de la vente des produits",

    invoice: "FACTURE",
    date: "Date",
    from: "De",
    item: "Article",
    price: "Prix",
    amount: "Montant",
    paymentMethod: "Mode de paiement",
    cash: "Espèces",
    debt: "Dette",
    clientName: "Nom du Client",
    clientNamePlaceholder: "Entrez le nom du client...",
    note: "Note",
    thankYou: "Merci pour votre confiance !",
  },
};


export default function SellProduct() {
  const [formData, setFormData] = useState({
    barcode: "",
    quantity: 1,
    customPrice: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash" or "debt"
  const [clientName, setClientName] = useState("");

  const [scannedCode, setScannedCode] = useState("");
  const [lang, setLang] = useState("en");
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // empty initially
  const [storeProducts, setStoreProducts] = useState([]);
  const [focusedInput, setFocusedInput] = useState("barcode"); // Track which input is focused
  const [showKeyboard, setShowKeyboard] = useState(false); // Virtual keyboard visibility
  const isKbEnabled = localStorage.getItem("kbEnabled") !== "false";
  const navigate = useNavigate();
  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    if (scannedCode) {
      setFormData((prev) => ({ ...prev, barcode: scannedCode }));
    }
  }, [scannedCode]);

  // Fetch all products of the store on mount
  useEffect(() => {
    const fetchStoreProducts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const storeId = user?.storeId;
        if (!storeId) throw new Error("No store assigned to user");

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleInputFocus = (field) => {
    setFocusedInput(field);
  };

  const handleKeypadPress = (key) => {
    setFormData((prev) => {
      let currentValue = String(prev[focusedInput]);

      if (key === "C") {
        return { ...prev, [focusedInput]: "" };
      }

      if (key === "⌫") {
        return { ...prev, [focusedInput]: currentValue.slice(0, -1) };
      }

      return { ...prev, [focusedInput]: currentValue + key };
    });
  };

  // Calculate Total Price
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 🔍 Search products by name, barcode, category, or description
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]); // don't show anything if input is empty
      return;
    }

    const filtered = storeProducts.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });

    setSearchResults(filtered);
  };

  // Virtual Keyboard Handlers
  const handleKeyboardPress = (key) => {
    if (key === 'Backspace') {
      setSearchQuery(prev => prev.slice(0, -1));
    } else if (key === 'Clear') {
      setSearchQuery('');
    } else {
      setSearchQuery(prev => prev + key);
    }
    // Trigger search after each key press
    setTimeout(() => handleSearch(), 100);
  };

  const addToCart = async () => {
    if (!formData.barcode || !formData.quantity)
      return alert(t.barcodeQtyRequired);


    try {
      const productData = storeProducts.find((p) => p.barcode === formData.barcode);
      if (!productData) throw new Error(t.productNotFound);

      const unitPrice = formData.customPrice
        ? Number(formData.customPrice)
        : Number(productData.price) || 0;

      setCart((prev) => [
        ...prev,
        {
          barcode: formData.barcode,
          quantity: Number(formData.quantity),
          price: unitPrice,
        },
      ]);

      setFormData({ barcode: "", quantity: 1, customPrice: "" });
      setScannedCode("");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };
  // Updated invoice generation code styled like provided image
  const generateInvoice = (cartItems, sellerId) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(10);
    doc.text("FennStore", 40, 40);
    doc.text("NO. " + String(Date.now()).slice(-6), pageWidth - 120, 40);

    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 40, 100);

    // Date
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 40, 140);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 100, 140);



    doc.setFont("helvetica", "bold");
    doc.text("From:", 40, 180);
    doc.setFont("helvetica", "normal");
    doc.text(["StoreX Algeria", "Rue du Magasin 45, Alger", "contact@storex.dz"], 40, 200);

    // Table Header
    let y = 300;

    doc.setFillColor(240, 240, 240);
    doc.rect(40, y, pageWidth - 80, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Item", 60, y + 20);
    doc.text("Quantity", 220, y + 20);
    doc.text("Price", 350, y + 20);
    doc.text("Amount", 460, y + 20);

    y += 50;
    let grandTotal = 0;

    doc.setFont("helvetica", "normal");

    cartItems.forEach((item) => {
      const total = item.quantity * item.price;
      grandTotal += total;

      doc.text(item.barcode, 60, y);
      doc.text(String(item.quantity), 240, y);
      doc.text(`$${item.price}`, 360, y);
      doc.text(`$${total}`, 470, y);

      y += 30;
    });

    // Total
    doc.setFont("helvetica", "bold");
    doc.text(`Total`, 400, y + 40);
    doc.text(`$${grandTotal}`, 470, y + 40);

    // Payment + Note
    doc.setFont("helvetica", "bold");
    doc.text("Payment method:", 40, y + 100);
    doc.setFont("helvetica", "normal");
    doc.text("Cash", 160, y + 100);

    doc.setFont("helvetica", "bold");
    doc.text("Note:", 40, y + 130);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for choosing us!", 100, y + 130);

    doc.save(`invoice_${Date.now()}.pdf`);
  };



  const handleSellAll = async () => {
    if (cart.length === 0) return alert(t.cartEmpty);
    if (paymentMethod === "debt" && !clientName.trim()) {
      return alert(lang === "ar" ? "يرجى إدخال اسم العميل للدين" : "Please enter Client Name for debt");
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const sellerId = user.id;
      const storeId = user.storeId;

      for (let item of cart) {
        const response = await fetch("http://localhost:3500/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode: item.barcode,
            quantity: item.quantity,
            transactionType: "sale",
            price: item.price,
            sellerId,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
      }

      // If it's a debt, create a debt record
      if (paymentMethod === "debt") {
        await fetch("http://localhost:3500/debts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            partyName: clientName,
            partyType: "client",
            amount: cartTotal,
            paidAmount: 0,
            description: `Sale of ${cart.length} items`
          })
        });
      }

      alert(t.soldSuccess);
      generateInvoice(cart, sellerId);
      setCart([]);
      setClientName("");
      setPaymentMethod("cash");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handleEditCartItem = (index) => {
    const itemToEdit = cart[index];
    setFormData({
      barcode: itemToEdit.barcode,
      quantity: itemToEdit.quantity,
      customPrice: itemToEdit.price, // Set custom price to current item price to preserve it
    });
    // Remove from cart so it can be re-added
    setCart(cart.filter((_, i) => i !== index));
    // Focus barcode input
    setFocusedInput("barcode");
  };

  return (
    <div className={`sell-container ${lang === "ar" ? "rtl" : ""}`}>
      {/* HEADER */}
      <div className="header-row">
        <div onClick={() => navigate("/")} className="back-btn-wrapper">
          <FiArrowLeft className="back-icon" />
        </div>
        <h2 className="title">{t.title}</h2>
      </div>

      <div className="sell-content">
        {/* LEFT PANEL: INTERACTION */}
        <div className="left-panel">

          {/* 1. SEARCH */}
          <div className="search-box">
            <h3>{t.searchTitle}</h3>
            <div className="search-bar-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch();
                }}
                readOnly={isKbEnabled}
                onFocus={() => {
                  handleInputFocus("barcode");
                  if (isKbEnabled) setShowKeyboard(true);
                }}
              />
              <button className="search-btn" onClick={handleSearch}>
                🔍
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((p) => (
                  <div key={p._id} className="search-item" onClick={() => {
                    setFormData(prev => ({ ...prev, barcode: p.barcode }));
                    setSearchResults([]);
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {p.barcode} - ${p.price} - Stock: {p.stock}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. SCANNER & FORM */}
          <div className="input-section">
            <div className="scanner-container">
              <div className="scanner-box">
                <Scanner
                  onDecode={(result) => setScannedCode(result)}
                  onError={(err) => console.error(err)}
                  constraints={{ facingMode: "environment" }}
                />
              </div>
              {scannedCode && (
                <div style={{ marginTop: 10, fontWeight: 'bold', color: '#3b82f6' }}>
                  {t.scannedBarcode} {scannedCode}
                </div>
              )}
            </div>

            <div className="manual-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t.barcode}</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    placeholder="12345..."
                    onChange={handleChange}
                    onFocus={() => {
                      handleInputFocus("barcode");
                      if (isKbEnabled) setShowKeyboard(true);
                    }}
                    readOnly={isKbEnabled}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group" style={{ maxWidth: '80px' }}>
                  <label>{t.quantity}</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus("quantity")}
                    readOnly={isKbEnabled}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t.customPrice}</label>
                <input
                  type="number"
                  name="customPrice"
                  value={formData.customPrice}
                  placeholder={t.customPricePlaceholder}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus("customPrice")}
                  readOnly={isKbEnabled}
                />
              </div>

              <button className="add-to-cart-btn" onClick={addToCart}>
                {t.addToCart}
              </button>

              <div className="keypad-container">
                <NumericKeypad onKeyPress={handleKeypadPress} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CART */}
        <div className="cart">
          <div className="cart-header">
            <h3>
              {t.cart} ({cart.length} {t.items})
            </h3>

          </div>

          <div className="cart-items">
            {cart.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>
                {t.noProducts}
              </p>
            )}

            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.barcode}</span>
                  <span className="item-details">
                    Qty: {item.quantity} × ${item.price}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 'bold' }}>${(item.quantity * item.price).toFixed(2)}</span>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditCartItem(index)}
                    title={t.edit}
                    style={{
                      background: '#e0f2fe',
                      color: '#0ea5e9',
                      border: 'none',
                      width: '28px',
                      height: '28px',
                      borderRadius: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => setCart(cart.filter((_, i) => i !== index))}
                    title={t.remove}
                  >
                    <FiDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="payment-method-section">
              <label className="payment-label">
                {t.paymentMethod}
              </label>
              <div className="payment-toggle">
                <button
                  className={`toggle-btn ${paymentMethod === 'cash' ? 'active cash' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  💵 {t.cash}
                </button>
                <button
                  className={`toggle-btn ${paymentMethod === 'debt' ? 'active debt' : ''}`}
                  onClick={() => setPaymentMethod('debt')}
                >
                  📝 {t.debt}
                </button>
              </div>

              {paymentMethod === 'debt' && (
                <div className="client-name-field">
                  <input
                    type="text"
                    className="client-input"
                    placeholder={t.clientNamePlaceholder}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>{t.total}</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="submit-btn" onClick={handleSellAll}>
              {t.submit}
            </button>
          </div>
        </div>
      </div>
      {/* Virtual Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyboardPress}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
}
