import { createTheme } from "@mui/material/styles";
import { FormControlLabel, Switch } from "@mui/material";
import { getTranslations as t } from "../../locales";

export const Theme = createTheme({
  palette: {
    primary: {
      main: "#464653",
    },
    white: {
      main: "#ffffff",
    },
    alabaster: {
      main: "#fafafa",
      dark: "#303030",
    },
    mountainMist: {
      main: "#9791a1",
    },
    gallery: {
      main: "#ebebeb",
    },
    cinnabar: {
      main: "#e74c3c",
    },
    denim: {
      main: "#1976d2",
    },
    hawkesBlue: {
      main: "#d0e5f5",
      light: "#e3f2fd",
    },
    mineShaft: {
      main: "#3f3f3f",
    },
    emperor: {
      main: "#525252",
    },
    mercury: {
      main: "#e9e9e9",
      light: "#f3f3f3",
    },
    alto: {
      main: "#e1e1e1",
      light: "#ebebeb",
    },
    flower: {
      main: "#fdecea",
      light: "#fadbd7",
      text: "#611a15",
    },
    cottonBoll: {
      main: "#e8f4fd",
      light: "#c9e1f2",
      text: "#0d3c61",
    },
    diamondBlack: {
      main: "rgba(0, 0, 0, 0.54)",
    },
  },
});

export const getInitialMode = () => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("darkTheme");
  if (stored === "1") return "dark";
  if (stored === "0") return "light";
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const DarkMode = ({ mode, setMode }) => {
  const checked = mode === "dark";

  const changeTheme = () => {
    const newMode = checked ? "light" : "dark";
    localStorage.setItem("darkTheme", newMode === "dark" ? "1" : "0");
    setMode(newMode);
  };

  return (
    <FormControlLabel
      value="darkModeEnabled"
      control={
        <Switch color="primary" checked={checked} onChange={changeTheme} />
      }
      label={t("dark_mode")}
      labelPlacement="start"
    />
  );
};
