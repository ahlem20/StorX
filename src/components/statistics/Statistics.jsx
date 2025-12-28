import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiUser,
  FiCalendar,
  FiClock,
  FiPieChart,
  FiBox,
  FiTag,
  FiFilter,
  FiTruck
} from "react-icons/fi";
import "./Statistics.css";

const translations = {
  en: {
    title: "Admin Dashboard",
    subtitle: "Real-time insights for {username}'s store",
    allTime: "All Time",
    last30Days: "Last 30 Days",
    last7Days: "Last 7 Days",
    today: "Today",
    totalSales: "Total Revenue",
    pureProfit: "Net Profit",
    transactionsCount: "Orders",
    itemsSold: "Products Sold",
    topProducts: "Best Selling Items",
    salesByCategory: "Revenue by Category",
    salesByUser: "Performance by Seller",
    dailyHighlights: "Sales Velocity",
    noData: "No data available",
    bestDay: "Peak Day",
    loading: "Initializing Dashboard...",
    unknownUser: "Unknown Seller",
    uncategorized: "Uncategorized",
    inventoryHealth: "Inventory Health",
    lowStock: "Low Stock Alert",
    outOfStock: "Out of Stock",
    recentActivity: "Recent Activity",
    stock: "In Stock",
    orderStatus: "Order Status",
    completed: "Completed",
    clientDebts: "Client Debts",
    supplierDebts: "Supplier Debts"
  },
  ar: {
    title: "لوحة تحكم المسؤول",
    subtitle: "رؤى فورية لمتجر {username}",
    allTime: "كل الوقت",
    last30Days: "آخر 30 يومًا",
    last7Days: "آخر 7 أيام",
    today: "اليوم",
    totalSales: "إجمالي الإيرادات",
    pureProfit: "صافي الربح",
    transactionsCount: "الطلبات",
    itemsSold: "المنتجات المباعة",
    topProducts: "الأصناف الأكثر مبيعاً",
    salesByCategory: "الإيرادات حسب الفئة",
    salesByUser: "أداء البائعين",
    dailyHighlights: "سرعة المبيعات",
    noData: "لا توجد بيانات متاحة",
    bestDay: "يوم الذروة",
    loading: "جاري تهيئة لوحة التحكم...",
    unknownUser: "بائع غير معروف",
    uncategorized: "غير مصنف",
    inventoryHealth: "سلامة المخزون",
    lowStock: "تنبيه انخفاض المخزون",
    outOfStock: "نفذ من المخزن",
    recentActivity: "النشاط الأخير",
    stock: "في المخزن",
    orderStatus: "حالة الطلب",
    completed: "مكتمل",
    clientDebts: "ديون العملاء",
    supplierDebts: "ديون الموردين"
  },
  fr: {
    title: "Tableau de Bord",
    subtitle: "Aperçu en temps réel pour le magasin de {username}",
    allTime: "Tout le temps",
    last30Days: "30 derniers jours",
    last7Days: "7 derniers jours",
    today: "Aujourd'hui",
    totalSales: "Chiffre d'Affaires",
    pureProfit: "Bénéfice Net",
    transactionsCount: "Commandes",
    itemsSold: "Produits Vendus",
    topProducts: "Meilleures Ventes",
    salesByCategory: "Revenus par Catégorie",
    salesByUser: "Performance Vendeur",
    dailyHighlights: "Vitesse des Ventes",
    noData: "Aucune donnée disponible",
    bestDay: "Jour de Pointe",
    loading: "Initialisation du Dashboard...",
    unknownUser: "Vendeur inconnu",
    uncategorized: "Non classé",
    inventoryHealth: "Santé des Stocks",
    lowStock: "Alerte Stock Bas",
    outOfStock: "Rupture de Stock",
    recentActivity: "Activité Récente",
    stock: "En Stock",
    orderStatus: "Statut Commande",
    completed: "Terminé",
    clientDebts: "Dettes Clients",
    supplierDebts: "Dettes Fournisseurs"
  }
};

const Statistics = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const storeId = user?.storeId;
  const lang = localStorage.getItem("lang") || "en";
  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      try {
        const transResponse = await fetch(
          `http://localhost:3500/transactions?storeId=${storeId}`
        );
        const transData = await transResponse.json();
        setAllTransactions(transData);
        setFilteredTransactions(transData);

        const usersResponse = await fetch(
          `http://localhost:3500/users/store?storeId=${storeId}`
        );
        const usersData = await usersResponse.json();
        setUsers(usersData);

        const productsResponse = await fetch(
          `http://localhost:3500/products/products?storeId=${storeId}`
        );
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch Debts
        const debtsResponse = await fetch(
          `http://localhost:3500/debts?storeId=${storeId}`
        );
        const debtsData = await debtsResponse.json();
        setDebts(debtsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  useEffect(() => {
    const now = new Date();
    let filtered = allTransactions;

    if (timeRange === "today") {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = allTransactions.filter(t => new Date(t.createdAt) >= today);
    } else if (timeRange === "week") {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = allTransactions.filter(t => new Date(t.createdAt) >= lastWeek);
    } else if (timeRange === "month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = allTransactions.filter(t => new Date(t.createdAt) >= lastMonth);
    }

    setFilteredTransactions(filtered);
  }, [timeRange, allTransactions]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const userMap = users.reduce((acc, u) => {
    acc[u._id] = u.username || u.name || u._id;
    return acc;
  }, {});

  const productMap = products.reduce((acc, p) => {
    acc[p.barcode] = {
      name: p.name,
      category: p.category,
      stock: p.stock,
      costPrice: parseFloat(p.costPrice) || 0
    };
    return acc;
  }, {});

  const totalTransactions = filteredTransactions.length;
  const totalSales = filteredTransactions.reduce(
    (sum, t) => sum + (t.transactionType === "sale" ? t.total : 0),
    0
  );

  const totalProfit = filteredTransactions.reduce((sum, t) => {
    if (t.transactionType !== "sale") return sum;
    // Prefer the cost price from the transaction if it exists and is non-zero,
    // otherwise look it up from the current product catalog.
    const currentProductCost = productMap[t.barcode]?.costPrice || 0;
    const transactionCost = t.costPrice || currentProductCost;

    // If the backend originally saved profit as equal to total (failed cost lookup), 
    // or if we have a better cost price, recalculate it.
    let profit = t.profit;
    if (profit === undefined || profit === null || profit === t.total || transactionCost > 0) {
      profit = (t.total - (transactionCost * t.quantity));
    }

    return sum + profit;
  }, 0);

  const totalQuantity = filteredTransactions.reduce((sum, t) => sum + (t.transactionType === "sale" ? t.quantity : 0), 0);

  const salesByUser = filteredTransactions.reduce((acc, t) => {
    if (t.transactionType === "sale") {
      const username = userMap[t.sellerId] || t.unknownUser;
      acc[username] = (acc[username] || 0) + t.total;
    }
    return acc;
  }, {});

  const salesByDay = filteredTransactions.reduce((acc, t) => {
    if (t.transactionType === "sale") {
      const day = new Date(t.createdAt).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + t.total;
    }
    return acc;
  }, {});

  const salesByCategory = filteredTransactions.reduce((acc, t) => {
    if (t.transactionType === "sale") {
      const category = productMap[t.barcode]?.category || t.uncategorized;
      acc[category] = (acc[category] || 0) + t.total;
    }
    return acc;
  }, {});

  const totalDebtTotals = debts.reduce((acc, d) => {
    const remaining = d.amount - d.paidAmount;
    if (d.partyType === "client") acc.clients += remaining;
    else acc.suppliers += remaining;
    acc.total += remaining;
    return acc;
  }, { clients: 0, suppliers: 0, total: 0 });

  const topProducts = filteredTransactions.reduce((acc, t) => {
    if (t.transactionType === "sale") {
      const name = productMap[t.barcode]?.name || t.barcode;
      acc[name] = (acc[name] || 0) + t.quantity;
    }
    return acc;
  }, {});

  const lowStockThreshold = 10;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold);
  const outOfStockItems = products.filter(p => p.stock === 0);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t.loading}</p>
      </div>
    );

  const renderStatsList = (obj, isCurrency = true) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, value]) => (
        <li key={key} className="list-item">
          <span className="item-label">{key}</span>
          <span className="item-value">
            {isCurrency ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString()}
          </span>
        </li>
      ));

  return (
    <div className={`statistics-page ${lang === "ar" ? "rtl" : ""}`}>
      <header className="stats-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            <FiArrowLeft />
          </button>
          <div className="header-title">
            <h1>{t.title}</h1>
            <p>{t.subtitle.replace("{username}", user?.username)}</p>
          </div>
        </div>

        <div className="filter-group">
          <FiFilter />
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="range-select">
            <option value="all">{t.allTime}</option>
            <option value="month">{t.last30Days}</option>
            <option value="week">{t.last7Days}</option>
            <option value="today">{t.today}</option>
          </select>
        </div>
      </header>

      <main className="stats-content">
        <section className="summary-grid">
          <div className="summary-card primary">
            <div className="card-icon"><FiTrendingUp /></div>
            <div className="card-info">
              <h3>{t.totalSales}</h3>
              <p className="value">${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="summary-card success">
            <div className="card-icon"><FiDollarSign /></div>
            <div className="card-info">
              <h3>{t.pureProfit}</h3>
              <p className="value">${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="summary-card info">
            <div className="card-icon"><FiPieChart /></div>
            <div className="card-info">
              <h3>{t.transactionsCount}</h3>
              <p className="value">{totalTransactions.toLocaleString()}</p>
            </div>
          </div>

          <div className="summary-card warning">
            <div className="card-icon"><FiShoppingCart /></div>
            <div className="card-info">
              <h3>{t.itemsSold}</h3>
              <p className="value">{totalQuantity.toLocaleString()}</p>
            </div>
          </div>

          <div className="summary-card info">
            <div className="card-icon"><FiUser /></div>
            <div className="card-info">
              <h3>{t.clientDebts}</h3>
              <p className="value" style={{ color: '#ef4444' }}>${totalDebtTotals.clients.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="summary-card warning">
            <div className="card-icon"><FiTruck /></div>
            <div className="card-info">
              <h3>{t.supplierDebts}</h3>
              <p className="value" style={{ color: '#ef4444' }}>${totalDebtTotals.suppliers.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          <div className="left-column">
            <section className="detailed-grid">
              <div className="detail-card">
                <div className="detail-header">
                  <FiBox className="heading-icon" />
                  <h3>{t.topProducts}</h3>
                </div>
                {Object.keys(topProducts).length === 0 ? (
                  <p className="empty-msg">{t.noData}</p>
                ) : (
                  <ul className="stats-list">{renderStatsList(topProducts, false)}</ul>
                )}
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <FiTag className="heading-icon" />
                  <h3>{t.salesByCategory}</h3>
                </div>
                {Object.keys(salesByCategory).length === 0 ? (
                  <p className="empty-msg">{t.noData}</p>
                ) : (
                  <ul className="stats-list">{renderStatsList(salesByCategory)}</ul>
                )}
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <FiUser className="heading-icon" />
                  <h3>{t.salesByUser}</h3>
                </div>
                {Object.keys(salesByUser).length === 0 ? (
                  <p className="empty-msg">{t.noData}</p>
                ) : (
                  <ul className="stats-list">{renderStatsList(salesByUser)}</ul>
                )}
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <FiCalendar className="heading-icon" />
                  <h3>{t.dailyHighlights}</h3>
                </div>
                {Object.keys(salesByDay).length === 0 ? (
                  <p className="empty-msg">{t.noData}</p>
                ) : (
                  <ul className="stats-list">
                    <li className="list-item highlight-today">
                      <div className="item-label-group">
                        <span className="item-label">{t.today}</span>
                        <span className="item-sublabel">{formatDate(new Date())}</span>
                      </div>
                      <span className="item-value">
                        ${(salesByDay[new Date().toISOString().split('T')[0]] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </li>
                    {(() => {
                      const sortedDays = Object.entries(salesByDay).sort((a, b) => b[1] - a[1]);
                      const bestDay = sortedDays[0];
                      if (!bestDay) return null;

                      const weekdayNames = {
                        ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
                        en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
                      }[lang] || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                      const bestDayName = weekdayNames[new Date(bestDay[0]).getDay()];

                      return (
                        <li className="list-item highlight-best">
                          <div className="item-label-group">
                            <span className="item-label">{t.bestDay}</span>
                            <span className="item-sublabel">{bestDayName} ({bestDay[0]})</span>
                          </div>
                          <span className="item-value profit">
                            ${bestDay[1].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </li>
                      );
                    })()}
                  </ul>
                )}
              </div>
            </section>

            <section className="activity-section">
              <div className="section-card">
                <div className="detail-header">
                  <FiClock className="heading-icon" />
                  <h3>{t.recentActivity}</h3>
                </div>
                <div className="table-responsive">
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>{t.itemsSold}</th>
                        <th>{t.today}</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.slice(0, 7).map(trx => (
                        <tr key={trx._id}>
                          <td>{productMap[trx.barcode]?.name || trx.barcode}</td>
                          <td>{formatDate(trx.createdAt)}</td>
                          <td className="font-bold">${trx.total.toFixed(2)}</td>
                          <td><span className="status-badge">{t.completed}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          <div className="right-column">
            <section className="health-section">
              <div className="detail-card health-card">
                <div className="detail-header">
                  <FiBox className="heading-icon" />
                  <h3>{t.inventoryHealth}</h3>
                </div>

                <div className="health-stat">
                  <div className="health-info">
                    <span>{t.outOfStock}</span>
                    <span className="health-count danger">{outOfStockItems.length}</span>
                  </div>
                  <div className="health-bar-bg"><div className="health-bar danger" style={{ width: `${(outOfStockItems.length / products.length) * 100 || 0}%` }}></div></div>
                </div>

                <div className="health-stat">
                  <div className="health-info">
                    <span>{t.lowStock}</span>
                    <span className="health-count warning">{lowStockItems.length}</span>
                  </div>
                  <div className="health-bar-bg"><div className="health-bar warning" style={{ width: `${(lowStockItems.length / products.length) * 100 || 0}%` }}></div></div>
                </div>

                <div className="health-stat">
                  <div className="health-info">
                    <span>{t.stock}</span>
                    <span className="health-count success">{products.length - outOfStockItems.length - lowStockItems.length}</span>
                  </div>
                  <div className="health-bar-bg"><div className="health-bar success" style={{ width: `${((products.length - outOfStockItems.length - lowStockItems.length) / products.length) * 100 || 100}%` }}></div></div>
                </div>
              </div>

              <div className="detail-card status-card">
                <div className="detail-header">
                  <FiPieChart className="heading-icon" />
                  <h3>{t.orderStatus}</h3>
                </div>
                <div className="donut-preview">
                  <div className="center-text">100%</div>
                  <div className="sub-text">{t.completed}</div>
                </div>
                <ul className="stats-list">
                  <li className="list-item">
                    <span className="item-label">{t.completed}</span>
                    <span className="item-value">{totalTransactions}</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
