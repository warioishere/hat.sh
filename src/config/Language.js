import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Button } from "@mui/material";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import { checkLocale } from "../../locales";
import { getTranslations as t } from "../../locales";
import locales from "../../locales/locales";

const Language = () => {
  const [language, setLanguage] = useState(checkLocale());

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    if (localStorage) {
      localStorage.setItem("language", e.target.value);
    }
    window.location.reload(true);
  };

  return (
    <>
      <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>{t("language")}</InputLabel>
        <Select
          value={language}
          onChange={handleLanguageChange}
          label={t("language")}
        >
          {Object.entries(locales).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              {name.language_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Alert
          sx={{ m: 1, minWidth: 120 }}
          severity="info"
          action={
            <Button
              href="https://github.com/sh-dv/hat.sh/blob/master/TRANSLATION.md"
              target="_blank"
            >
              {t("guide")}
            </Button>
          }
        >
          {t("help_translate")}
        </Alert>
      </Box>
    </>
  );
};

export default Language;
