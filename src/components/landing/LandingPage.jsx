import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const translations = {
  en: {
    title: "Welcome to StoreX",
    description:
      "Manage your products, sales, and stock efficiently with StoreX. Start your journey now!",
    cta: "Get Started",
    addingProducts: "Adding Products",
    sellingProduct: "Selling Product",
    stock: "Stock",
    updateStock: "Update Stock",
    users: "Users",
    statistics: "Statistics",
    debts: "Debt Management",
    login: "Login",
    signup: "Sign Up",
    hello: "Hello",
    logout: "Logout",
    kbOn: "Keyboard On",
    kbOff: "Keyboard Off",
  },
  ar: {
    title: "مرحباً بك في StoreX",
    description:
      "قم بإدارة منتجاتك، مبيعاتك، والمخزون بكفاءة مع StoreX. ابدأ رحلتك الآن!",
    cta: "ابدأ الآن",
    addingProducts: "إضافة المنتجات",
    sellingProduct: "بيع المنتج",
    stock: "المخزون",
    updateStock: "تحديث المخزون",
    users: "المستخدمون",
    statistics: "الإحصائيات",
    debts: "إدارة الديون",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    hello: "مرحباً",
    logout: "تسجيل الخروج",
    kbOn: "لوحة المفاتيح مفعلة",
    kbOff: "لوحة المفاتيح معطلة",
  },
  fr: {
    title: "Bienvenue à StoreX",
    description:
      "Gérez vos produits, ventes et stocks efficacement avec StoreX. Commencez votre aventure maintenant !",
    cta: "Commencer",
    addingProducts: "Ajout de produits",
    sellingProduct: "Vente de produit",
    stock: "Stock",
    updateStock: "Mettre à jour le stock",
    users: "Utilisateurs",
    statistics: "Statistiques",
    debts: "Gestion des Dettes",
    login: "Connexion",
    signup: "S'inscrire",
    hello: "Bonjour",
    logout: "Déconnexion",
    kbOn: "Clavier Activé",
    kbOff: "Clavier Désactivé",
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [kbEnabled, setKbEnabled] = useState(true);
  const navigate = useNavigate();
  const t = translations[lang];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const savedLang = localStorage.getItem("lang");
    if (savedLang) setLang(savedLang);

    const savedKb = localStorage.getItem("kbEnabled");
    if (savedKb !== null) setKbEnabled(savedKb === "true");
  }, []);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const toggleKb = () => {
    const newValue = !kbEnabled;
    setKbEnabled(newValue);
    localStorage.setItem("kbEnabled", newValue.toString());
  };

  return (
    <div className={`landing-page ${lang === "ar" ? "rtl" : ""}`}>
      {/* Language Selector */}
      <div className="language-selector">
        <select value={lang} onChange={(e) => handleLangChange(e.target.value)}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Authentication Buttons */}
      <div className="auth-buttons">
        {user ? (
          <>
            <button
              onClick={toggleKb}
              className={`kb-toggle ${kbEnabled ? 'on' : 'off'}`}
            >
              {kbEnabled ? "⌨️ " + t.kbOn : "✖️ " + t.kbOff}
            </button>
            <span>
              {t.hello}, <strong>{user.username}</strong>
            </span>
            <button onClick={handleLogout}>{t.logout}</button>
          </>
        ) : null}
      </div>

      {/* Hero Section - only show if user is not logged in */}
      {!user && (
        <div className="landing-hero fade-in">
          <div className="hero-text">
            <h1>{t.title}</h1>
            <p>{t.description}</p>
            <div className="hero-cta">
              <button className="cta-button" onClick={() => navigate("/login")}>
                {t.cta}
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/logo1.png" alt="Store Illustration" />
          </div>
        </div>
      )}

      {/* App Buttons for Logged-in Users */}
      {user && (
        <div className="landing-card fade-in">
          <h2 className="hero-text2">{t.title}</h2>
          <div className="button-container">
            <button className="app-button" onClick={() => navigate("/adding-product")}>
              📦 {t.addingProducts}
            </button>
            <button className="app-button" onClick={() => navigate("/selling-product")}>
              🏬 {t.sellingProduct}
            </button>
            <button className="app-button" onClick={() => navigate("/buy")}>
              🔄 {t.updateStock}
            </button>
            {user?.role === "admin" && (
              <>
                <button className="app-button" onClick={() => navigate("/adding-products")}>
                  📊 {t.stock}
                </button>

                <button className="app-button" onClick={() => navigate("/statistics")}>
                  📈 {t.statistics}
                </button>

                <button className="app-button" onClick={() => navigate("/debts")}>
                  💸 {t.debts}
                </button>

                <button className="app-button" onClick={() => navigate("/users")}>
                  👤 {t.users}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
