import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit, FiTrash2, FiPlus, FiPrinter, FiPackage, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import VirtualKeyboard from "../sells/VirtualKeyboard";
import "./PurchaseHistoryPage.css";

export default function StoreProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductsForInvoice, setSelectedProductsForInvoice] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'search' or 'name', 'category', etc.
  const [keyboardTarget, setKeyboardTarget] = useState(null); // 'searchText' or 'editForm'
  const isKbEnabled = localStorage.getItem("kbEnabled") !== "false";

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storeId = storedUser?.storeId;


  const translations = {
    fr: {
      title: "Produits du magasin",
      search: "Rechercher",
      name: "Nom",
      category: "Catégorie",
      barcode: "Code-barres",
      price: "Prix",
      costPrice: "Prix de revient",
      stock: "Stock",
      description: "Description",
      print: "Imprimer",
      delete: "Supprimer",
      edit: "Modifier",
      save: "Sauvegarder",
      cancel: "Annuler",
      new: "Nouveau",
      noData: "Aucune donnée",
      confirmDelete: "Voulez-vous vraiment supprimer ce produit ?",
      selectProduct: "Veuillez sélectionner un produit",
      updateStock: "Mettre à jour le stock",
      startDate: "Date début",
      endDate: "Date fin",
    },
    en: {
      title: "Store Products",
      search: "Search",
      name: "Name",
      category: "Category",
      barcode: "Barcode",
      price: "Price",
      costPrice: "Cost Price",
      stock: "Stock",
      description: "Description",
      print: "Print",
      delete: "Delete",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      new: "New",
      noData: "No data",
      confirmDelete: "Do you really want to delete this product?",
      selectProduct: "Please select a product",
      updateStock: "Update Stock",
      startDate: "Start Date",
      endDate: "End Date",
    },
    ar: {
      title: "منتجات المتجر",
      search: "بحث",
      name: "الاسم",
      category: "الفئة",
      barcode: "الباركود",
      price: "السعر",
      costPrice: "سعر التكلفة",
      stock: "المخزون",
      description: "الوصف",
      print: "طباعة",
      delete: "حذف",
      edit: "تعديل",
      save: "حفظ",
      cancel: "الغاء",
      noData: "لا توجد بيانات",
      confirmDelete: "هل تريد حقًا حذف هذا المنتج؟",
      selectProduct: "يرجى اختيار منتج",
      updateStock: "تحديث المخزون",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
    },
  };
  const t = translations[lang];

  // Fetch products
  const fetchProducts = async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`http://localhost:3500/products/products?storeId=${storeId}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [lang]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Filtered products by text and date
  const filteredProducts = products.filter((p) => {
    const matchesText =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.category.toLowerCase().includes(searchText.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchText.toLowerCase());

    const productDate = new Date(p.createdAt || p.date); // adjust field if needed
    const matchesDate =
      (!startDate || new Date(startDate) <= productDate) &&
      (!endDate || productDate <= new Date(endDate));

    return matchesText && matchesDate;
  });

  /*** DELETE PRODUCT ***/
  const handleDelete = async () => {
    let productToDelete = selectedProduct;
    if (!productToDelete) {
      if (products.length === 0) return alert(t.noData);
      productToDelete = products[0];
    }

    if (!window.confirm(t.confirmDelete)) return;

    try {
      const res = await fetch(`http://localhost:3500/products/${productToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert("✔ Product deleted successfully!");
        setSelectedProduct(null);
        fetchProducts();
      } else {
        throw new Error(data.error || "Failed to delete product");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  /*** EDIT PRODUCT ***/
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditForm({ ...product });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`http://localhost:3500/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setEditModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      } else throw new Error(data.error || "Failed to update product");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleKeyboardPress = (key) => {
    if (keyboardTarget === "searchText") {
      if (key === "Clear") setSearchText("");
      else if (key === "Backspace") setSearchText((prev) => prev.slice(0, -1));
      else setSearchText((prev) => prev + key);
    } else if (keyboardTarget === "editForm" && focusedInput) {
      if (key === "Clear") {
        setEditForm((prev) => ({ ...prev, [focusedInput]: "" }));
      } else if (key === "Backspace") {
        setEditForm((prev) => ({
          ...prev,
          [focusedInput]: prev[focusedInput]?.toString().slice(0, -1) || "",
        }));
      } else {
        setEditForm((prev) => ({
          ...prev,
          [focusedInput]: (prev[focusedInput] || "").toString() + key,
        }));
      }
    }
  };

  const handleNew = () => navigate("/adding-product");

  /*** PRINT PRODUCTS WITH TEMPLATE ***/
  const handlePrint = () => {
    const productsToPrint = selectedProductsForInvoice.length
      ? filteredProducts.filter((p) => selectedProductsForInvoice.includes(p._id))
      : filteredProducts;

    if (!productsToPrint.length) return alert(t.noData);

    let tableRows = productsToPrint.map(
      (p, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.barcode}</td>
      <td>${p.price}</td>
      <td>${p.costPrice}</td>
      <td>${p.stock}</td>
      <td>${p.description}</td>
    </tr>
  `
    ).join("");

    const newWin = window.open("", "_blank");
    newWin.document.write(`
    <html>
      <head>
        <title>by FeenDev</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 5px; }
          h2 { text-align: center; margin-top: 0; margin-bottom: 20px; font-weight: normal; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${t.title}</h1>
        <h2> StoreX</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t.name}</th>
              <th>${t.category}</th>
              <th>${t.barcode}</th>
              <th>${t.price}</th>
              <th>${t.costPrice}</th>
              <th>${t.stock}</th>
              <th>${t.description}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  return (
    <div className="store-products-page" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="back-button" onClick={() => navigate("/")}>
            <FiArrowLeft size={24} />
          </div>
          <h1>{t.title}</h1>
        </div>
        <div className="language-switcher">
          {["fr", "en", "ar"].map((l) => (
            <button key={l} className={lang === l ? "active" : ""} onClick={() => handleLangChange(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <FiPackage />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Products</span>
            <h3>{filteredProducts.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Value</span>
            <h3>${filteredProducts.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock</span>
            <h3>{filteredProducts.filter(p => p.stock < 10).length}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="main-card">
        {/* Search & Actions */}
        <div className="actions-bar">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder={t.search}
              value={searchText}
              readOnly={isKbEnabled}
              onFocus={() => {
                if (isKbEnabled) {
                  setKeyboardTarget("searchText");
                  setFocusedInput(null);
                  setShowKeyboard(true);
                }
              }}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="filters-wrapper">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder={t.startDate} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder={t.endDate} />
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={handlePrint} title={t.print}><FiPrinter /> <span>{t.print}</span></button>
            <button className="btn-danger" onClick={handleDelete} title={t.delete} disabled={!selectedProduct}><FiTrash2 /> <span>{t.delete}</span></button>
            <button className="btn-primary" onClick={() => selectedProduct && openEditModal(selectedProduct)} title={t.edit} disabled={!selectedProduct}><FiEdit /> <span>{t.edit}</span></button>
            <button className="btn-success" onClick={handleNew} title={t.new}><FiPlus /> <span>{t.new}</span></button>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>{t.name}</th>
                <th>{t.category}</th>
                <th>{t.barcode}</th>
                <th>{t.price}</th>
                <th>{t.costPrice}</th>
                <th>Margin</th>
                <th>{t.stock}</th>
                <th>{t.description}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    <div className="no-data-content">
                      <FiPackage size={48} />
                      <p>{t.noData}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stockStatus = p.stock <= 0 ? 'out' : p.stock < 10 ? 'low' : 'good';
                  const margin = p.price - p.costPrice;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className={selectedProduct?._id === p._id ? "selected" : ""}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedProductsForInvoice.includes(p._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductsForInvoice([...selectedProductsForInvoice, p._id]);
                              } else {
                                setSelectedProductsForInvoice(
                                  selectedProductsForInvoice.filter((id) => id !== p._id)
                                );
                              }
                            }}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td style={{ fontWeight: '600', color: '#1e293b' }}>{p.name}</td>
                      <td><span className="category-tag">{p.category}</span></td>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{p.barcode}</td>
                      <td style={{ fontWeight: '700' }}>${p.price}</td>
                      <td style={{ color: '#64748b' }}>${p.costPrice}</td>
                      <td style={{ color: margin > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                        ${margin.toFixed(2)}
                      </td>
                      <td>
                        <span className={`stock-badge ${stockStatus}`}>
                          {p.stock} {stockStatus === 'out' ? '(Out)' : ''}
                        </span>
                      </td>
                      <td className="description-cell">
                        {p.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.edit}</h3>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>{t.name}</label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  readOnly={isKbEnabled}
                  onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("name"); setShowKeyboard(true); } }}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder={t.name}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t.category}</label>
                  <input
                    type="text"
                    value={editForm.category || ""}
                    readOnly={isKbEnabled}
                    onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("category"); setShowKeyboard(true); } }}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder={t.category}
                  />
                </div>
                <div className="form-group">
                  <label>{t.barcode}</label>
                  <input
                    type="text"
                    value={editForm.barcode || ""}
                    readOnly={isKbEnabled}
                    onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("barcode"); setShowKeyboard(true); } }}
                    onChange={e => setEditForm({ ...editForm, barcode: e.target.value })}
                    placeholder={t.barcode}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t.price}</label>
                  <input
                    type="text"
                    value={editForm.price || ""}
                    readOnly={isKbEnabled}
                    onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("price"); setShowKeyboard(true); } }}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder={t.price}
                  />
                </div>
                <div className="form-group">
                  <label>{t.costPrice}</label>
                  <input
                    type="text"
                    value={editForm.costPrice || ""}
                    readOnly={isKbEnabled}
                    onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("costPrice"); setShowKeyboard(true); } }}
                    onChange={e => setEditForm({ ...editForm, costPrice: e.target.value })}
                    placeholder={t.costPrice}
                  />
                </div>
                <div className="form-group">
                  <label>{t.stock}</label>
                  <input
                    type="text"
                    value={editForm.stock || ""}
                    readOnly={isKbEnabled}
                    onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("stock"); setShowKeyboard(true); } }}
                    onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                    placeholder={t.stock}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t.description}</label>
                <textarea
                  value={editForm.description || ""}
                  readOnly={isKbEnabled}
                  onFocus={() => { if (isKbEnabled) { setKeyboardTarget("editForm"); setFocusedInput("description"); setShowKeyboard(true); } }}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder={t.description}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditModalOpen(false)}>{t.cancel}</button>
              <button className="btn-primary" onClick={handleEditSave}>{t.save}</button>
            </div>
          </div>
        </div>
      )}
      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyboardPress}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
}
