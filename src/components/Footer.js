/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import Link from "@mui/material/Link";
import { Chip, Avatar, Box } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { IconButton, Tooltip, TextField } from "@mui/material";
import { Alert } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { getTranslations as t } from "../../locales";
import { QRCodeCanvas as QRCode } from "qrcode.react";

export default function Footer() {
  const [donateDialog, setDonateDialog] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const btcAddr = "bc1q6322795srhywlq6d5sh8x5y6g2tzq9x5qy7sw8";

  const handleSnackClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackOpen(false);
    handleSnackOpen();
  };

  const handleSnackOpen = () => {
    setTimeout(function () {
      setSnackOpen(true);
    }, 60000);
  };

  const handleClickOpen = () => {
    setDonateDialog(true);
  };

  const handleClose = () => {
    setDonateDialog(false);
  };

  useEffect(() => {
    handleSnackOpen();
  }, []);

  return (
    <div style={{ marginTop: "auto" }}>
      <footer
        style={{
          textAlign: "center",
          color: "rgba(0, 0, 0, 0.54)",
          padding: "24px 16px",
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1">
            Built and developed by{" "}
            <Link
              href="https://github.com/sh-dv"
              target="_blank"
              rel="noopener"
              color="inherit"
            >
              {"sh-dv"}
            </Link>
          </Typography>
          <Typography variant="body2" style={{ marginTop: 4 }}>
            Forked and updated by{" "}
            <Link
              href="https://yourdevice.ch"
              target="_blank"
              rel="noopener"
              color="inherit"
              style={{ fontWeight: 500 }}
            >
              {"yourdevice.ch"}
            </Link>
          </Typography>

          <Chip
            size="small"
            sx={{
              mt: "5px",
              border: "none",
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "none",
              color: "rgba(0, 0, 0, 0.54)",
              backgroundColor: "#ebebeb",
              "&:hover": { backgroundColor: "#e1e1e1" },
              "&:focus": { backgroundColor: "#e1e1e1", boxShadow: "none" },
              transition: "background-color 0.2s ease-out",
            }}
            avatar={
              <Avatar src="/assets/icons/btc-logo.png"></Avatar>
            }
            label="Donations Accepted"
            clickable
            onClick={() => handleClickOpen()}
            onDelete={() => handleClickOpen()}
            deleteIcon={
              <MonetizationOnIcon style={{ color: "#9791a1" }} />
            }
          />
          <Dialog
            scroll="body"
            maxWidth="sm"
            fullWidth
            open={donateDialog}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              elevation: 0,
            }}
            sx={{
              "& .MuiDialog-scrollPaper": {
                alignItems: "start",
                marginTop: "10vh",
              },
            }}
          >
            <DialogTitle>{"Donations"}</DialogTitle>

            <DialogContent>
              <DialogContentText style={{ textAlign: "center" }}>
                Hat.sh is an open-source application. Donations of any size
                are appreciated.
              </DialogContentText>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "auto",
                  width: "fit-content",
                  marginBottom: 20,
                }}
              >
                <QRCode
                  style={{
                    borderRadius: 8,
                    margin: 10,
                    boxShadow: "0px 0px 35px 2px rgba(0,0,0,0.2)",
                  }}
                  value={`bitcoin:${btcAddr}`}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"M"}
                  includeMargin={true}
                  imageSettings={{
                    src: "/assets/icons/btc-logo.png",
                    x: null,
                    y: null,
                    height: 40,
                    width: 40,
                    excavate: false,
                  }}
                />
              </div>
              <TextField
                style={{ marginBottom: 15 }}
                defaultValue={btcAddr}
                label="Bitcoin"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title="Copy address" placement="left">
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(btcAddr);
                        }}
                      >
                        <FileCopyIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                variant="outlined"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                {t("close")}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </footer>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Snackbar
          style={{ zIndex: 1 }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          open={snackOpen}
          autoHideDuration={10000}
          onClose={handleSnackClose}
        >
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" onClick={handleClickOpen}>
                <svg
                  enableBackground="new 0 0 24 24"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <g>
                    <rect fill="none" height="24" width="24" />
                  </g>
                  <g>
                    <g>
                      <rect fill="#427aa6" height="11" width="4" x="1" y="11" />
                      <path
                        fill="#427aa6"
                        d="M16,3.25C16.65,2.49,17.66,2,18.7,2C20.55,2,22,3.45,22,5.3c0,2.27-2.91,4.9-6,7.7c-3.09-2.81-6-5.44-6-7.7 C10,3.45,11.45,2,13.3,2C14.34,2,15.35,2.49,16,3.25z"
                      />
                      <path
                        fill="#427aa6"
                        d="M20,17h-7l-2.09-0.73l0.33-0.94L13,16h2.82c0.65,0,1.18-0.53,1.18-1.18v0c0-0.49-0.31-0.93-0.77-1.11L8.97,11H7v9.02 L14,22l8.01-3v0C22,17.9,21.11,17,20,17z"
                      />
                    </g>
                  </g>
                </svg>
              </Button>
            }
          >
            {t("donation_message")}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  );
}
