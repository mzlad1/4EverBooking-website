import React from "react";
import { useTranslation } from "react-i18next";
import "./language.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang); // Change the language
    localStorage.setItem("language", lang); // Save the selected language to localStorage
  };

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage); // Initialize with saved language on component mount
    }
  }, [i18n]);

  return (
    <div className="language-switcher-modern">
      <button
        className={
          i18n.language === "en"
            ? "language-button-modern active-modern"
            : "language-button-modern"
        }
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
      <button
        className={
          i18n.language === "ar"
            ? "language-button-modern active-modern"
            : "language-button-modern"
        }
        onClick={() => changeLanguage("ar")}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSwitcher;
