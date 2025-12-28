import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const translations = {
  en: {
    title: "Create Store & Admin",
    username: "Admin Username",
    password: "Admin Password",
    storeName: "Store Name",
    storeDescription: "Store Description",
    button: "Create Store & Admin",
    loginPrompt: "Already have an account?",
    loginLink: "Login",
    error: "Failed to create account",
  },
  ar: {
    title: "إنشاء المتجر والمشرف",
    username: "اسم المستخدم للمشرف",
    password: "كلمة مرور المشرف",
    storeName: "اسم المتجر",
    storeDescription: "وصف المتجر",
    button: "إنشاء المتجر والمشرف",
    loginPrompt: "هل لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    error: "فشل إنشاء الحساب",
  },
  fr: {
    title: "Créer magasin & admin",
    username: "Nom d'utilisateur Admin",
    password: "Mot de passe Admin",
    storeName: "Nom du magasin",
    storeDescription: "Description du magasin",
    button: "Créer magasin & admin",
    loginPrompt: "Vous avez déjà un compte ?",
    loginLink: "Connexion",
    error: "Échec de la création du compte",
  },
};

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navigate = useNavigate();
  const t = translations[lang];

  // Load saved language
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) setLang(savedLang);
  }, []);

  // Language selector
  const handleLangChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem("lang", selectedLang);
    setShowLangMenu(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1️⃣ Create User
      const userRes = await fetch("http://localhost:3500/users/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: "admin",
        }),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error(userData.error || t.error);
      }

      const ownerId = userData.user._id;

      // 2️⃣ Create Store
      const storeRes = await fetch("http://localhost:3500/stores/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName,
          description: storeDescription,
          ownerId,
        }),
      });

      const storeData = await storeRes.json();

      if (!storeRes.ok) {
        throw new Error(storeData.error || t.error);
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`auth-page ${lang === "ar" ? "rtl" : ""}`}>
      <div className="auth-card">
        {/* Language selector */}
        <div className="lang-select">
          <button
            className="lang-btn"
            onClick={() => setShowLangMenu((prev) => !prev)}
          >
            {lang === "en"
              ? " English"
              : lang === "ar"
              ? " العربية"
              : " Français"}{" "}
            ▼
          </button>
          {showLangMenu && (
            <ul className="lang-menu">
              <li onClick={() => handleLangChange({ target: { value: "en" } })}>
                 English
              </li>
              <li onClick={() => handleLangChange({ target: { value: "ar" } })}>
                 العربية
              </li>
              <li onClick={() => handleLangChange({ target: { value: "fr" } })}>
                 Français
              </li>
            </ul>
          )}
        </div>

        <h2>{t.title}</h2>
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder={t.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t.storeName}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t.storeDescription}
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            required
          />
          <button type="submit">{t.button}</button>
        </form>

        {error && <p className="error">{error}</p>}

        <p>
          {t.loginPrompt}{" "}
          <span onClick={() => navigate("/login")} className="link">
            {t.loginLink}
          </span>
        </p>
      </div>
    </div>
  );
}
