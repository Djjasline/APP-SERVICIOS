import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "astap_theme";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(STORAGE_KEY) || "dark";
  });

  useEffect(() => {
    const safeTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = safeTheme;
    localStorage.setItem(STORAGE_KEY, safeTheme);
  }, [theme]);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme === "light" ? "light" : "dark");
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLight: theme === "light",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return value;
};
