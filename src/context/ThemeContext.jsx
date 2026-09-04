import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "astap_theme";
const THEMES = ["dark", "light", "liquid"];

function normalizeTheme(value) {
  return THEMES.includes(value) ? value : "dark";
}

function getNextTheme(theme) {
  const currentIndex = THEMES.indexOf(normalizeTheme(theme));
  return THEMES[(currentIndex + 1) % THEMES.length];
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return normalizeTheme(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    const safeTheme = normalizeTheme(theme);
    document.documentElement.dataset.theme = safeTheme;
    localStorage.setItem(STORAGE_KEY, safeTheme);
  }, [theme]);

  const setTheme = (nextTheme) => {
    setThemeState(normalizeTheme(nextTheme));
  };

  const toggleTheme = () => {
    setThemeState((current) => getNextTheme(current));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLight: theme === "light",
        isLiquid: theme === "liquid",
        nextTheme: getNextTheme(theme),
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
