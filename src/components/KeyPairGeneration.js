/* eslint-disable @next/next/no-html-link-for-pages */
import { useState } from "react";
import Alert from "@mui/material/Alert";
import { AlertTitle } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { Typography, Box } from "@mui/material";
import { Paper, Grid, Tooltip } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import { TextField } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { generateAsymmetricKeys } from "../utils/generateAsymmetricKeys";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { getTranslations as t } from "../../locales";
import QuickResponseCode from "./QuickResponseCode";

const styles = {
  root: {
    mt: "50px",
    width: "100%",
    "& > * + *": { mt: 2 },
  },
  generateNowText: {
    float: "right",
    color: "mountainMist.main",
    cursor: "pointer",
    textDecoration: "underline",
    ml: "4px",
  },
  caption: {
    float: "right",
    color: "mountainMist.main",
  },
  keyCaption: {
    float: "left",
    color: "mountainMist.main",
    ml: "4px",
    "&:hover": {
      cursor: "pointer",
      textDecoration: "underline",
    },
  },
  button: {
    mt: 1,
    mr: 1,
    borderRadius: "8px",
    border: "none",
    color: "#1976d2",
    backgroundColor: "#e3f2fd",
    "&:hover": { backgroundColor: "#d0e5f5" },
    transition: "background-color 0.2s ease-out",
    textTransform: "none",
  },
  alertContainer: {
    p: 3,
    boxShadow: "rgba(149, 157, 165, 0.4) 0px 8px 24px",
    borderRadius: "8px",
  },
};

const KeysGeneration = (props) => {
  const [open, setOpen] = useState(false);

  const [PublicKey, setPublicKey] = useState();
  const [PrivateKey, setPrivateKey] = useState();
  const [generateBtnText, setGenerateBtnText] = useState(
    t("generate_key_pair_button")
  );

  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const generateKeys = async () => {
    let generated = await generateAsymmetricKeys();
    setPublicKey(generated.publicKey);
    setPrivateKey(generated.privateKey);
    setGenerateBtnText(t("generate_another_key_pair_button"));
  };

  const downloadKey = (data, filename) => {
    let file = new Blob([data], { type: "text/plain" });

    let a = document.createElement("a"),
      url = URL.createObjectURL(file);

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <>
      {!props.opened && (
        <div>
          <Typography
            variant="caption"
            sx={styles.generateNowText}
            onClick={() => {
              setOpen(true);
            }}
          >
            {t("generate_now_button")}
          </Typography>

          <Typography variant="caption" sx={styles.caption}>
            {t("key_pair_question")}
          </Typography>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <a href="/about/#why-need-private-key" target="_blank">
              <Typography variant="caption" sx={styles.keyCaption}>
                {t("why_need_private_key")}
              </Typography>
            </a>
          </Box>
        </div>
      )}
      <Box sx={styles.root}>
        <Collapse in={open || props.opened}>
          <Paper elevation={0} sx={styles.alertContainer}>
            <Alert
              variant="outlined"
              severity="info"
              style={{ border: "none", marginBottom: "15px" }}
              action={
                <IconButton
                  id="closeGenBtn"
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <AlertTitle>{t("key_pair_generation_title")}</AlertTitle>
            </Alert>

            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12}>
                <TextField
                  id="generatedPublicKey"
                  label={t("public_key")}
                  value={PublicKey ? PublicKey : ""}
                  placeholder={t("generate_public_key")}
                  InputProps={{
                    readOnly: true,
                    endAdornment: PublicKey && (
                      <>
                        <QuickResponseCode publicKey={PublicKey} />
                        <Tooltip
                          title={t("download_public_key")}
                          placement="bottom"
                        >
                          <IconButton
                            onClick={() => downloadKey(PublicKey, "key.public")}
                          >
                            <GetAppIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ),
                  }}
                  variant="outlined"
                  style={{ marginBottom: "15px" }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="generatedPrivateKey"
                  type={showPrivateKey ? "text" : "password"}
                  label={t("private_key")}
                  value={PrivateKey ? PrivateKey : ""}
                  placeholder={t("generate_private_key")}
                  helperText={t("private_key_notice")}
                  InputProps={{
                    readOnly: true,
                    endAdornment: PrivateKey && (
                      <>
                        <Tooltip
                          title={t("show_private_key")}
                          placement="bottom"
                        >
                          <IconButton
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                          >
                            {showPrivateKey ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={t("download_private_key")}
                          placement="bottom"
                        >
                          <IconButton
                            onClick={() =>
                              downloadKey(PrivateKey, "key.private")
                            }
                          >
                            <GetAppIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ),
                  }}
                  variant="outlined"
                  style={{ marginBottom: "15px" }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  onClick={generateKeys}
                  className="keyPairGenerateBtn"
                  variant="outlined"
                  startIcon={PrivateKey && <CachedIcon />}
                  fullWidth
                  sx={styles.button}
                >
                  {generateBtnText}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>
    </>
  );
};

export default KeysGeneration;
