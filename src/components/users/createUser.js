import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VirtualKeyboard from "../sells/VirtualKeyboard";
import "./createUser.css";

const translations = {
  en: {
    title: "Create New User",
    username: "Username",
    password: "Password",
    submit: "Create User",
    success: "User created successfully!",
    errorNoStore: "Your account does not have a store assigned.",
    back: "Back to",
    dashboard: "Dashboard",
  },
  fr: {
    title: "Créer un nouvel utilisateur",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    submit: "Créer l'utilisateur",
    success: "Utilisateur créé avec succès !",
    errorNoStore: "Votre compte n'a pas de magasin assigné.",
    back: "Retour à",
    dashboard: "Tableau de bord",
  },
  ar: {
    title: "إنشاء مستخدم جديد",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    submit: "إنشاء المستخدم",
    success: "تم إنشاء المستخدم بنجاح!",
    errorNoStore: "حسابك لا يحتوي على متجر محدد.",
    back: "العودة إلى",
    dashboard: "لوحة التحكم",
  },
};

export default function CreateUserPage() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const t = translations[lang];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'username' or 'password'
  const isKbEnabled = localStorage.getItem("kbEnabled") !== "false";
  const navigate = useNavigate();

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const handleKeyboardPress = (key) => {
    if (key === "{close}") {
      setShowKeyboard(false);
      return;
    }

    if (focusedInput === "username") {
      if (key === "{clear}") setUsername("");
      else if (key === "{bksp}") setUsername((prev) => prev.slice(0, -1));
      else setUsername((prev) => prev + key);
    } else if (focusedInput === "password") {
      if (key === "{clear}") setPassword("");
      else if (key === "{bksp}") setPassword((prev) => prev.slice(0, -1));
      else setPassword((prev) => prev + key);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const storedUser = localStorage.getItem("user");
      let storeId;

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          storeId = user.storeId;
        } catch {
          storeId = null;
        }
      }

      if (!storeId) {
        setError(t.errorNoStore);
        return;
      }

      const res = await fetch("http://localhost:3500/users/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: "user",
          storeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess(t.success);
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`create-user-page ${lang === "ar" ? "rtl" : ""}`}>
      {/* Language Switcher */}
      <div className="language-switcher">
        <button
          className={lang === "en" ? "active" : ""}
          onClick={() => handleLangChange("en")}
        >
          EN
        </button>
        <button
          className={lang === "fr" ? "active" : ""}
          onClick={() => handleLangChange("fr")}
        >
          FR
        </button>
        <button
          className={lang === "ar" ? "active" : ""}
          onClick={() => handleLangChange("ar")}
        >
          AR
        </button>
      </div>

      <div className="create-user-card">
        <h2>{t.title}</h2>

        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            placeholder={t.username}
            value={username}
            readOnly={isKbEnabled}
            onFocus={() => {
              if (isKbEnabled) {
                setFocusedInput("username");
                setShowKeyboard(true);
              }
            }}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type={isKbEnabled ? "text" : "password"}
            placeholder={t.password}
            value={password}
            readOnly={isKbEnabled}
            onFocus={() => {
              if (isKbEnabled) {
                setFocusedInput("password");
                setShowKeyboard(true);
              }
            }}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{t.submit}</button>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <p>
          {t.back}{" "}
          <span onClick={() => navigate("/")} className="link">
            {t.dashboard}
          </span>
        </p>
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
