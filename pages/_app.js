/* eslint-disable @next/next/no-sync-scripts */
import { useState, useEffect, createContext } from "react";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import { getTranslations as t } from "../locales";
import "../public/assets/styles/style.css";
import { Theme, getInitialMode } from "../src/config/Theme";

export const ThemeModeContext = createContext();

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("light");

  useEffect(() => {
    setMode(getInitialMode());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("darkStyle");
    } else {
      document.documentElement.classList.remove("darkStyle");
    }
  }, [mode]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={Theme}>
        <Head>
          <title>{`Hat.sh - ${t("sub_title")}`}</title>
          <link rel="icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/assets/icons/pwa/icon-192x192.png" />

          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Encrypt and Decrypt files securely in your browser."
          />
          <meta
            name="Keywords"
            content="encrypt decrypt encryption file-encryption javascript client-side serverless decryption xchcha20 argon2id encryption-decryption webcrypto crypto browser in-browser"
          />
          <meta
            name="theme-color"
            content="#fafafa"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="#1c1c1c"
            media="(prefers-color-scheme: dark)"
          />
        </Head>

        <Component {...pageProps} />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export default MyApp;
