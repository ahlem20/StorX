import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const translations = {
  en: {
    login: "Login",
    username: "Username",
    password: "Password",
    button: "Login",
    signupPrompt: "Don't have an account?",
    signupLink: "Sign up",
    error: "Login failed",
  },
  ar: {
    login: "تسجيل الدخول",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    button: "تسجيل الدخول",
    signupPrompt: "ليس لديك حساب؟",
    signupLink: "إنشاء حساب",
    error: "فشل تسجيل الدخول",
  },
  fr: {
    login: "Connexion",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    button: "Se connecter",
    signupPrompt: "Pas de compte ?",
    signupLink: "S'inscrire",
    error: "Échec de la connexion",
  },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  // Handle language change
  const handleLangChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem("lang", selectedLang);
    setShowLangMenu(false); // close menu after selection
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3500/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || t.error);
      }

      const data = await res.json();

      // Save user data and token
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      navigate("/");
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

        <h2>{t.login}</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit">{t.button}</button>
        </form>

        {error && <p className="error">{error}</p>}

        <p>
          {t.signupPrompt}{" "}
          <span onClick={() => navigate("/signup")} className="link">
            {t.signupLink}
          </span>
        </p>
      </div>
    </div>
  );
}
