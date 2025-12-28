import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiTrash2,
    FiUser, FiTruck, FiDollarSign, FiCalendar, FiFilter
} from "react-icons/fi";
import "./DebtsPage.css";

const translations = {
    en: {
        title: "Debt Management",
        clients: "Clients Debts",
        suppliers: "Suppliers Debts",
        totalDebt: "Total Outstanding",
        searchPlaceholder: "Search by name or description...",
        addDebt: "Add Debt Record",
        partyName: "Name",
        partyType: "Type",
        client: "Client",
        supplier: "Supplier",
        amount: "Total Amount",
        paidAmount: "Paid Amount",
        remaining: "Remaining",
        dueDate: "Due Date",
        status: "Status",
        active: "Outstanding",
        paid: "Paid Full",
        description: "Description",
        actions: "Actions",
        noData: "No debt records found.",
        save: "Save Record",
        cancel: "Cancel",
        confirmDelete: "Are you sure you want to delete this record?",
        loading: "Loading data...",
        unknown: "Unknown"
    },
    ar: {
        title: "إدارة الديون",
        clients: "ديون العملاء",
        suppliers: "ديون الموردين",
        totalDebt: "إجمالي الديون المعلقة",
        searchPlaceholder: "ابحث بالاسم أو الوصف...",
        addDebt: "إضافة سجل دين",
        partyName: "الاسم",
        partyType: "النوع",
        client: "عميل",
        supplier: "مورد",
        amount: "المبلغ الإجمالي",
        paidAmount: "المبلغ المدفوع",
        remaining: "المتبقي",
        dueDate: "تاريخ الاستحقاق",
        status: "الحالة",
        active: "معلق",
        paid: "مدفوع بالكامل",
        description: "الوصف",
        actions: "الإجراءات",
        noData: "لا توجد سجلات ديون.",
        save: "حفظ السجل",
        cancel: "إلغاء",
        confirmDelete: "هل أنت متأكد من حذف هذا السجل؟",
        loading: "جاري التحميل...",
        unknown: "غير معروف"
    },
    fr: {
        title: "Gestion des Dettes",
        clients: "Dettes Clients",
        suppliers: "Dettes Fournisseurs",
        totalDebt: "Total Impayé",
        searchPlaceholder: "Rechercher par nom ou description...",
        addDebt: "Ajouter une Dette",
        partyName: "Nom",
        partyType: "Type",
        client: "Client",
        supplier: "Fournisseur",
        amount: "Montant Total",
        paidAmount: "Montant Payé",
        remaining: "Reste",
        dueDate: "Date d'Échéance",
        status: "Statut",
        active: "En cours",
        paid: "Payé",
        description: "Description",
        actions: "Actions",
        noData: "Aucun enregistrement de dette trouvé.",
        save: "Enregistrer",
        cancel: "Annuler",
        confirmDelete: "Voulez-vous vraiment supprimer cet enregistrement ?",
        loading: "Chargement...",
        unknown: "Inconnu"
    }
};

const DebtsPage = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [filterType, setFilterType] = useState("all"); // all, client, supplier
    const [formData, setFormData] = useState({
        partyName: "",
        partyType: "client",
        amount: "",
        paidAmount: "0",
        dueDate: "",
        description: ""
    });

    const navigate = useNavigate();
    const lang = localStorage.getItem("lang") || "en";
    const t = translations[lang] || translations.en;
    const user = JSON.parse(localStorage.getItem("user"));
    const storeId = user?.storeId;

    useEffect(() => {
        if (storeId) {
            fetchDebts();
        }
    }, [storeId]);

    const fetchDebts = async () => {
        try {
            const res = await fetch(`http://localhost:3500/debts?storeId=${storeId}`);
            const data = await res.json();
            setDebts(data);
        } catch (error) {
            console.error("Error fetching debts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (debt = null) => {
        if (debt) {
            setEditingDebt(debt);
            setFormData({
                partyName: debt.partyName,
                partyType: debt.partyType,
                amount: debt.amount.toString(),
                paidAmount: debt.paidAmount.toString(),
                dueDate: debt.dueDate || "",
                description: debt.description || ""
            });
        } else {
            setEditingDebt(null);
            setFormData({
                partyName: "",
                partyType: "client",
                amount: "",
                paidAmount: "0",
                dueDate: "",
                description: ""
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDebt(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            storeId,
            amount: parseFloat(formData.amount),
            paidAmount: parseFloat(formData.paidAmount) || 0
        };

        try {
            const url = editingDebt
                ? `http://localhost:3500/debts/${editingDebt._id}`
                : "http://localhost:3500/debts";
            const method = editingDebt ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchDebts();
                handleCloseModal();
            }
        } catch (error) {
            console.error("Error saving debt:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.confirmDelete)) return;
        try {
            const res = await fetch(`http://localhost:3500/debts/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchDebts();
            }
        } catch (error) {
            console.error("Error deleting debt:", error);
        }
    };

    const filteredDebts = debts.filter(d => {
        const matchesSearch = d.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterType === "all" || d.partyType === filterType;
        return matchesSearch && matchesFilter;
    });

    const totals = debts.reduce((acc, d) => {
        const remaining = d.amount - d.paidAmount;
        if (d.partyType === "client") acc.clients += remaining;
        else acc.suppliers += remaining;
        acc.total += remaining;
        return acc;
    }, { clients: 0, suppliers: 0, total: 0 });

    if (loading) return <div className="loading">{t.loading}</div>;

    return (
        <div className={`debts-page ${lang === "ar" ? "rtl" : ""}`}>
            <header className="debts-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate("/")}>
                        <FiArrowLeft />
                    </button>
                    <h1>{t.title}</h1>
                </div>
                <button className="add-debt-btn" onClick={() => handleOpenModal()}>
                    <FiPlus /> {t.addDebt}
                </button>
            </header>

            <section className="debts-summary">
                <div className="summary-card">
                    <div className="card-icon client"><FiUser /></div>
                    <div className="card-info">
                        <h3>{t.clients}</h3>
                        <p className="value">${totals.clients.toLocaleString()}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon supplier"><FiTruck /></div>
                    <div className="card-info">
                        <h3>{t.suppliers}</h3>
                        <p className="value">${totals.suppliers.toLocaleString()}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon total"><FiDollarSign /></div>
                    <div className="card-info">
                        <h3>{t.totalDebt}</h3>
                        <p className="value">${totals.total.toLocaleString()}</p>
                    </div>
                </div>
            </section>

            <div className="debts-actions">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group-btns">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                        <option value="all">All Types</option>
                        <option value="client">{t.client}</option>
                        <option value="supplier">{t.supplier}</option>
                    </select>
                </div>
            </div>

            <div className="debts-table-card">
                <table className="debts-table">
                    <thead>
                        <tr>
                            <th>{t.partyName}</th>
                            <th>{t.partyType}</th>
                            <th>{t.amount}</th>
                            <th>{t.paidAmount}</th>
                            <th>{t.remaining}</th>
                            <th>{t.dueDate}</th>
                            <th>{t.status}</th>
                            <th>{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDebts.length > 0 ? filteredDebts.map(d => (
                            <tr key={d._id}>
                                <td style={{ fontWeight: 600 }}>{d.partyName}</td>
                                <td>
                                    <span className={`party-type ${d.partyType}`}>
                                        {d.partyType === "client" ? t.client : t.supplier}
                                    </span>
                                </td>
                                <td>${d.amount.toLocaleString()}</td>
                                <td>${d.paidAmount.toLocaleString()}</td>
                                <td style={{ color: d.amount - d.paidAmount > 0 ? "#ef4444" : "#10b981", fontWeight: 700 }}>
                                    ${(d.amount - d.paidAmount).toLocaleString()}
                                </td>
                                <td>{d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "-"}</td>
                                <td>
                                    <span className={`status-badge ${d.status}`}>
                                        {d.status === "paid" ? t.paid : t.active}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn" onClick={() => handleOpenModal(d)}><FiEdit2 /></button>
                                    <button className="action-btn" onClick={() => handleDelete(d._id)}><FiTrash2 /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                                    {t.noData}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingDebt ? t.save : t.addDebt}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t.partyName}</label>
                                <input
                                    name="partyName"
                                    value={formData.partyName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter name..."
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.partyType}</label>
                                <div className="type-selector-wrapper">
                                    <button
                                        type="button"
                                        className={`type-option ${formData.partyType === 'client' ? 'active client' : ''}`}
                                        onClick={() => setFormData({ ...formData, partyType: 'client' })}
                                    >
                                        <FiUser /> {t.client}
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-option ${formData.partyType === 'supplier' ? 'active supplier' : ''}`}
                                        onClick={() => setFormData({ ...formData, partyType: 'supplier' })}
                                    >
                                        <FiTruck /> {t.supplier}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>{t.amount}</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t.paidAmount}</label>
                                    <input
                                        type="number"
                                        name="paidAmount"
                                        value={formData.paidAmount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t.dueDate}</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t.description}</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Additional notes..."
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>{t.cancel}</button>
                                <button type="submit" className="btn-submit">{t.save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtsPage;
