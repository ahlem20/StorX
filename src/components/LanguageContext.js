import React, { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("fr");

  // Load language from localStorage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang) setLang(storedLang);
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
