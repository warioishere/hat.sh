/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "../helpers/formatBytes";
import { formatName } from "../helpers/formatName";
import {
  crypto_secretstream_xchacha20poly1305_ABYTES,
  CHUNK_SIZE,
} from "../config/Constants";
import { unzipSync } from "fflate";
import { Alert, AlertTitle } from "@mui/material";
import Grid from "@mui/material/Grid";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Backdrop from "@mui/material/Backdrop";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import DescriptionIcon from "@mui/icons-material/Description";
import GetAppIcon from "@mui/icons-material/GetApp";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { getTranslations as t } from "../../locales";
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

let file,
  index,
  decFileBuff,
  files = [],
  password,
  currFile = 0,
  numberOfFiles,
  decryptionMethodState,
  privateKey,
  publicKey;

export default function DecryptionPanel() {
  const router = useRouter();

  const query = router.query;

  const [activeStep, setActiveStep] = useState(0);

  const [Files, setFiles] = useState([]);

  const [currFileState, setCurrFileState] = useState(0);

  const [Password, setPassword] = useState();

  const [decryptionMethod, setDecryptionMethod] = useState("secretKey");

  const [PublicKey, setPublicKey] = useState();

  const [PrivateKey, setPrivateKey] = useState();

  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const [wrongPublicKey, setWrongPublicKey] = useState(false);

  const [wrongPrivateKey, setWrongPrivateKey] = useState(false);

  const [keysError, setKeysError] = useState(false);

  const [keysErrorMessage, setKeysErrorMessage] = useState();

  const [badFile, setbadFile] = useState();

  const [oldVersion, setOldVersion] = useState();

  const [fileMixUp, setFileMixUp] = useState(false);

  const [wrongPassword, setWrongPassword] = useState(false);

  const [isCheckingFile, setIsCheckingFile] = useState(false);

  const [isTestingPassword, setIsTestingPassword] = useState(false);

  const [isTestingKeys, setIsTestingKeys] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [processedBytes, setProcessedBytes] = useState(0);

  const [pkAlert, setPkAlert] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      handleFilesInput(acceptedFiles);
    },
    noClick: true,
    noKeyboard: true,
    disabled: activeStep !== 0,
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setWrongPassword(false);
    setWrongPublicKey(false);
    setWrongPrivateKey(false);
    setKeysError(false);
    setIsTestingKeys(false);
    setIsTestingPassword(false);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFiles([]);
    setPassword();
    setWrongPassword(false);
    setbadFile(false);
    setOldVersion(false);
    setFileMixUp(false);
    setPublicKey();
    setPrivateKey();
    privateKey = null;
    publicKey = null;
    setWrongPublicKey(false);
    setWrongPrivateKey(false);
    setKeysError(false);
    setPkAlert(false);
    file = null;
    index = null;
    files = [];
    numberOfFiles = 0;
    resetCurrFile();
    setProgress(0);
    setProcessedBytes(0);
    router.replace(router.pathname);
  };

  const resetCurrFile = () => {
    currFile = 0;
    setCurrFileState(currFile);
  };

  const updateCurrFile = () => {
    currFile += 1;
    setCurrFileState(currFile);
  };

  const resetFileErrors = () => {
    setbadFile(false);
    setOldVersion(false);
    setFileMixUp(false);
    resetCurrFile();
    decryptionMethodState = null;
  };

  const handleFilesInput = (selectedFiles) => {
    selectedFiles = Array.from(selectedFiles);
    if (files.length > 0) {
      files = files.concat(selectedFiles);
      files = files.filter(
        (thing, index, self) =>
          index ===
          self.findIndex((t) => t.name === thing.name && t.size === thing.size)
      );
    } else {
      files = selectedFiles;
    }
    setFiles(files);
    resetFileErrors();
  };

  const updateFilesInput = (index) => {
    files = [...files.slice(0, index), ...files.slice(index + 1)];
    setFiles(files);
    resetFileErrors();
  };

  const resetFilesInput = () => {
    files = [];
    setFiles(files);
    resetFileErrors();
  };

  const handlePasswordInput = (selectedPassword) => {
    setPassword(selectedPassword);
    password = selectedPassword;
    setWrongPassword(false);
  };

  const checkFile = (file) => {
    navigator.serviceWorker.ready.then((reg) => {
      setIsCheckingFile(true);
      setbadFile(false);
      setOldVersion(false);
      setFileMixUp(false);

      Promise.all([
        file.slice(0, 11).arrayBuffer(), //signatures
        file.slice(0, 22).arrayBuffer(), //v1 signature
      ]).then(([signature, legacy]) => {
        reg.active.postMessage({
          cmd: "checkFile",
          signature,
          legacy,
        });
      });
    });
  };

  const checkFiles = () => {
    numberOfFiles = files.length;
    if (currFile <= numberOfFiles - 1) {
      checkFile(files[currFile]);
    }
  };

  const checkFilesQueue = () => {
    if (numberOfFiles > 1) {
      updateCurrFile();

      if (currFile <= numberOfFiles - 1) {
        checkFiles();
      } else {
        setActiveStep(1);
        setIsCheckingFile(false);
        resetCurrFile();
      }
    }
  };

  const checkFileMixUp = () => {
    setFileMixUp(true);
    setIsCheckingFile(false);
  };

  const checkFilesTestQueue = () => {
    if (numberOfFiles > 1) {
      updateCurrFile();

      if (currFile <= numberOfFiles - 1) {
        testFilesDecryption();
      } else {
        setIsTestingKeys(false);
        setIsTestingPassword(false);
        handleNext();
        resetCurrFile();
      }
    }
  };

  const testFilesDecryption = () => {
    numberOfFiles = files.length;
    if (currFile <= numberOfFiles - 1) {
      testDecryption(files[currFile]);
    }
  };

  const testDecryption = (file) => {
    if (decryptionMethodState === "secretKey") {
      navigator.serviceWorker.ready.then((reg) => {
        setIsTestingPassword(true);
        setWrongPassword(false);

        Promise.all([
          file.slice(0, 11).arrayBuffer(), //signature
          file.slice(11, 27).arrayBuffer(), //salt
          file.slice(27, 51).arrayBuffer(), //header
          file
            .slice(
              51,
              51 + CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES
            )
            .arrayBuffer(), //17
        ]).then(([signature, salt, header, chunk]) => {
          decFileBuff = chunk; //for testing the dec password
          reg.active.postMessage({
            cmd: "requestTestDecryption",
            password,
            signature,
            salt,
            header,
            decFileBuff,
          });
        });
      });
    }

    if (decryptionMethodState === "publicKey") {
      navigator.serviceWorker.ready.then((reg) => {
        setIsTestingKeys(true);
        setKeysError(false);
        setWrongPrivateKey(false);
        setWrongPublicKey(false);

        let mode = "test";

        Promise.all([
          file.slice(11, 35).arrayBuffer(), //header
          file
            .slice(
              35,
              35 + CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES
            )
            .arrayBuffer(), //17
        ]).then(([header, chunk]) => {
          decFileBuff = chunk;
          reg.active.postMessage({
            cmd: "requestDecKeyPair",
            privateKey,
            publicKey,
            header,
            decFileBuff,
            mode,
          });
        });
      });
    }
  };

  const handlePublicKeyInput = (selectedKey) => {
    setPublicKey(selectedKey);
    publicKey = selectedKey;
    setWrongPublicKey(false);
  };

  const loadPublicKey = (file) => {
    if (file) {
      // files must be of text and size below 1 mb
      if (file.size <= 1000000) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          setPublicKey(reader.result);
          publicKey = reader.result;
        };
      }
    }
  };

  const handlePrivateKeyInput = (selectedKey) => {
    setPrivateKey(selectedKey);
    privateKey = selectedKey;
    setWrongPrivateKey(false);
  };

  const loadPrivateKey = (file) => {
    if (file) {
      // files must be of text and size below 1 mb
      if (file.size <= 1000000) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          setPrivateKey(reader.result);
          privateKey = reader.result;
        };
      }
    }
  };

  const handleEncryptedFilesDownload = async (e) => {
    numberOfFiles = Files.length;
    prepareFile();
  };

  const prepareFile = () => {
    // send file name to sw
    let fileName = encodeURIComponent(formatName(files[currFile].name));
    navigator.serviceWorker.ready.then((reg) => {
      reg.active.postMessage({ cmd: "prepareFileNameDec", fileName });
    });
  };

  const kickOffDecryption = async (e) => {
    if (currFile <= numberOfFiles - 1) {
      file = files[currFile];
      setIsDownloading(true);
      setProgress(0);
      setProcessedBytes(0);

      // Trigger download via fetch + blob for reliable cross-browser support
      const formatName = (await import("../helpers/formatName")).formatName;
      // Expected decrypted size: input minus headers and auth tags
      const headerSize = decryptionMethodState === "secretKey" ? 51 : 35;
      const numChunks = Math.ceil((file.size - headerSize) / (CHUNK_SIZE + 17));
      const expectedSize = file.size - headerSize - numChunks * 17;
      fetch("file").then((response) => {
        const reader = response.body.getReader();
        const chunks = [];
        let totalBytes = 0;
        const pump = () =>
          reader.read().then(async ({ done, value }) => {
            if (done) {
              const blob = new Blob(chunks);
              const arr = new Uint8Array(await blob.arrayBuffer());

              // Check if decrypted file is a ZIP (magic bytes: PK\x03\x04)
              if (arr[0] === 0x50 && arr[1] === 0x4B && arr[2] === 0x03 && arr[3] === 0x04) {
                try {
                  const unzipped = unzipSync(arr);
                  for (const [name, data] of Object.entries(unzipped)) {
                    const fileBlob = new Blob([data]);
                    const url = URL.createObjectURL(fileBlob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                } catch {
                  // Not a valid ZIP, download as-is
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = formatName(files[currFile].name);
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = formatName(files[currFile].name);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
              return;
            }
            chunks.push(value);
            totalBytes += value.length;
            setProcessedBytes(totalBytes);
            setProgress(Math.min(Math.round((totalBytes / expectedSize) * 100), 100));
            return pump();
          });
        pump();
      });

      if (decryptionMethodState === "secretKey") {
        navigator.serviceWorker.ready.then((reg) => {
          Promise.all([
            file.slice(0, 11).arrayBuffer(), //signature
            file.slice(11, 27).arrayBuffer(), //salt
            file.slice(27, 51).arrayBuffer(), //header
            file
              .slice(
                51,
                51 + CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES
              )
              .arrayBuffer(), //17
          ]).then(([signature, salt, header, chunk]) => {
            reg.active.postMessage({
              cmd: "requestDecryption",
              password,
              signature,
              salt,
              header,
            });
          });
        });
      }

      if (decryptionMethodState === "publicKey") {
        navigator.serviceWorker.ready.then((reg) => {
          let mode = "derive";

          Promise.all([
            file.slice(11, 35).arrayBuffer(), //header
            file
              .slice(
                35,
                35 + CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES
              )
              .arrayBuffer(), //17
          ]).then(([header, chunk]) => {
            decFileBuff = chunk;
            reg.active.postMessage({
              cmd: "requestDecKeyPair",
              privateKey,
              publicKey,
              header,
              decFileBuff,
              mode,
            });
          });
        });
      }
    } else {
      // console.log("out of files")
    }
  };

  const startDecryption = (method) => {
    let startIndex;
    if (method === "secretKey") startIndex = 51;
    if (method === "publicKey") startIndex = 35;

    file = files[currFile];

    navigator.serviceWorker.ready.then((reg) => {
      file
        .slice(
          startIndex,
          startIndex + CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES
        )
        .arrayBuffer()
        .then((chunk) => {
          index =
            startIndex +
            CHUNK_SIZE +
            crypto_secretstream_xchacha20poly1305_ABYTES;
          reg.active.postMessage(
            { cmd: "decryptFirstChunk", chunk, last: index >= file.size },
            [chunk]
          ); // transfer chunk ArrayBuffer to service worker
        });
    });
  };

  const continueDecryption = (e) => {
    file = files[currFile];

    navigator.serviceWorker.ready.then((reg) => {
      file
        .slice(
          index,
          index + CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES
        )
        .arrayBuffer()
        .then((chunk) => {
          index += CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES;
          e.source.postMessage(
            { cmd: "decryptRestOfChunks", chunk, last: index >= file.size },
            [chunk]
          );
        });
    });
  };

  useEffect(() => {
    if (query.tab === "decryption" && query.publicKey) {
      setPublicKey(query.publicKey);
      publicKey = query.publicKey;
      setPkAlert(true);
      setDecryptionMethod("publicKey");
      decryptionMethodState = "publicKey";
    }
  }, [query.publicKey, query.tab]);

  useEffect(() => {
    navigator.serviceWorker.addEventListener("message", (e) => {
      switch (e.data.reply) {
        case "badFile":
          if (numberOfFiles > 1) {
            setbadFile(files[currFile].name);
            setIsCheckingFile(false);
          } else {
            setbadFile(true);
            setIsCheckingFile(false);
          }
          break;

        case "oldVersion":
          if (numberOfFiles > 1) {
            setOldVersion(files[currFile].name);
            setIsCheckingFile(false);
          } else {
            setOldVersion(true);
            setIsCheckingFile(false);
          }
          break;

        case "secretKeyEncryption":
          if (numberOfFiles > 1) {
            if (
              decryptionMethodState &&
              decryptionMethodState !== "secretKey"
            ) {
              checkFileMixUp();
              return;
            } else {
              decryptionMethodState = "secretKey";
              setDecryptionMethod("secretKey");
              checkFilesQueue();
            }
          } else {
            setDecryptionMethod("secretKey");
            decryptionMethodState = "secretKey";
            setActiveStep(1);
            setIsCheckingFile(false);
            resetCurrFile();
          }
          break;

        case "publicKeyEncryption":
          if (numberOfFiles > 1) {
            if (
              decryptionMethodState &&
              decryptionMethodState !== "publicKey"
            ) {
              checkFileMixUp();
              return;
            } else {
              decryptionMethodState = "publicKey";
              setDecryptionMethod("publicKey");
              checkFilesQueue();
            }
          } else {
            setDecryptionMethod("publicKey");
            decryptionMethodState = "publicKey";
            setActiveStep(1);
            setIsCheckingFile(false);
            resetCurrFile();
          }
          break;

        case "wrongDecPrivateKey":
          setWrongPrivateKey(true);
          setIsTestingKeys(false);
          break;

        case "wrongDecPublicKey":
          setWrongPublicKey(true);
          setIsTestingKeys(false);
          break;

        case "wrongDecKeys":
          setWrongPublicKey(true);
          setWrongPrivateKey(true);
          setIsTestingKeys(false);
          break;

        case "wrongDecKeyPair":
          setKeysError(true);
          setKeysErrorMessage(t("invalid_key_pair"));
          setIsTestingKeys(false);
          break;

        case "wrongDecKeyInput":
          setKeysError(true);
          setKeysErrorMessage(t("invalid_keys_input"));
          setIsTestingKeys(false);
          break;

        case "wrongPassword":
          setWrongPassword(true);
          setIsTestingPassword(false);
          break;

        case "filePreparedDec":
          kickOffDecryption();
          break;

        case "readyToDecrypt":
          if (numberOfFiles > 1) {
            checkFilesTestQueue();
          } else {
            setIsTestingKeys(false);
            setIsTestingPassword(false);
            handleNext();
            resetCurrFile();
          }
          break;

        case "decKeyPairGenerated":
          startDecryption("publicKey");
          break;

        case "decKeysGenerated":
          startDecryption("secretKey");
          break;

        case "continueDecryption":
          continueDecryption(e);
          break;

        case "decryptionFinished":
          if (numberOfFiles > 1) {
            updateCurrFile();
            file = null;
            index = null;
            if (currFile <= numberOfFiles - 1) {
              setTimeout(function () {
                prepareFile();
              }, 1000);
            } else {
              setIsDownloading(false);
              handleNext();
            }
          } else {
            setIsDownloading(false);
            handleNext();
          }
          break;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ width: "100%" }} {...getRootProps()}>
      <Backdrop open={isDragActive} style={{ zIndex: 10 }}>
        <Typography
          variant="h2"
          gutterBottom
          style={{ color: "#fff", textAlign: "center" }}
        >
          <img
            src="/assets/images/logo2.png"
            width="100"
            height="100"
            alt="hat.sh logo"
          />
          <br />
          {t("drop_file_dec")}
        </Typography>
      </Backdrop>

      <Collapse in={pkAlert} style={{ marginTop: 5 }}>
        <Alert
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setPkAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {t("sender_key_loaded")}
        </Alert>
      </Collapse>

      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{ backgroundColor: "transparent" }}
      >
        <Step key={1}>
          <StepLabel
            StepIconProps={{
              sx: {
                "&.Mui-active": {
                  color: "#525252",
                },
                "&.Mui-completed": {
                  color: "#525252",
                },
              },
            }}
          >
            {t("choose_files_dec")}
          </StepLabel>
          <StepContent>
            <div className="wrapper p-3" id="decFileWrapper">
              <Box
                id="decFileArea"
                sx={{
                  padding: "20px",
                  border: "5px dashed",
                  borderColor: "#ebebeb",
                  borderRadius: "14px",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginBottom: "10px",
                  display: Files.length > 0 ? "" : "flex",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    marginBottom: "15px",
                    overflow: "auto",
                    maxHeight: "280px",
                    backgroundColor: "transparent",
                  }}
                >
                  <List
                    dense={true}
                    sx={{
                      display: "flex",
                      flex: "1",
                      flexWrap: "wrap",
                      alignContent: "center",
                      justifyContent: "center",
                    }}
                  >
                    {Files.length > 0
                      ? Files.map((file, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              backgroundColor: "#f3f3f3",
                              borderRadius: "8px",
                              padding: "15px",
                            }}
                          >
                            <ListItemText
                              sx={{
                                width: "100px",
                                maxWidth: "150px",
                                minHeight: "50px",
                                maxHeight: "50px",
                              }}
                              primary={file.name}
                              secondary={formatBytes(file.size)}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                style={{ marginTop: 40 }}
                                onClick={() => updateFilesInput(index)}
                                edge="end"
                                aria-label="delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      : t("drag_drop_files")}
                  </List>
                </Paper>

                <input
                  {...getInputProps()}
                  style={{ display: "none" }}
                  id="dec-file"
                  type="file"
                  onChange={(e) => handleFilesInput(e.target.files)}
                  multiple
                />
                <label htmlFor="dec-file">
                  <Button
                    sx={{
                      padding: "8px",
                      paddingLeft: "15px",
                      paddingRight: "15px",
                      textTransform: "none",
                      borderRadius: "8px",
                      border: "none",
                      color: "#3f3f3f",
                      backgroundColor: "#ebebeb",
                      "&:hover": {
                        backgroundColor: "#e1e1e1",
                      },
                      transition: "color .01s",
                    }}
                    component="span"
                    startIcon={
                      Files.length > 0 ? <AddIcon /> : <DescriptionIcon />
                    }
                  >
                    {Files.length > 0 ? t("add_files") : t("browse_files")}
                  </Button>
                </label>

                {Files.length > 0 && (
                  <>
                    <Button
                      onClick={() => resetFilesInput()}
                      sx={{
                        marginLeft: "8px",
                        padding: "8px",
                        paddingLeft: "15px",
                        paddingRight: "15px",
                        textTransform: "none",
                        borderRadius: "8px",
                        border: "none",
                        color: "#611a15",
                        backgroundColor: "#fdecea",
                        "&:hover": {
                          backgroundColor: "#fadbd7",
                        },
                        transition: "color .01s",
                      }}
                      component="span"
                      startIcon={<RotateLeftIcon />}
                    >
                      {t("reset")}
                    </Button>

                    <Box
                      component="small"
                      sx={{
                        float: "right",
                        marginTop: "15px",
                        textTransform: "none",
                        color: "#0d3c61",
                        transition: "color .01s",
                      }}
                    >
                      {Files.length} {Files.length > 1 ? t("files") : t("file")}
                    </Box>
                  </>
                )}
              </Box>
            </div>

            <Box sx={{ marginBottom: "16px" }}>
              <div>
                <Button
                  disabled={isCheckingFile || Files.length === 0}
                  variant="contained"
                  onClick={checkFiles}
                  className="nextBtnHs submitFileDec"
                  sx={{
                    marginTop: "8px",
                    marginRight: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#464653",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#3f3f3f",
                    },
                    transition: "color .01s",
                  }}
                  startIcon={
                    isCheckingFile && (
                      <CircularProgress size={24} />
                    )
                  }
                  fullWidth
                >
                  {isCheckingFile ? t("checking_file") : t("next")}
                </Button>
              </div>

              {badFile && (
                <Alert severity="error" style={{ marginTop: 15 }}>
                  {t("file_not_encrypted_corrupted")}
                  <br />
                  {Files.length > 1 ? <strong>{badFile}</strong> : ""}
                </Alert>
              )}

              {oldVersion && (
                <Alert severity="error" style={{ marginTop: 15 }}>
                  {t("old_version")}{" "}
                  <a href="https://v1.hat.sh/" target="_blank" rel="noreferrer">
                    {"https://v1.hat.sh"}
                  </a>
                  <br />
                  {Files.length > 1 ? <strong>{oldVersion}</strong> : ""}
                </Alert>
              )}

              {fileMixUp && (
                <Alert severity="error" style={{ marginTop: 15 }}>
                  {t("file_mixup")}
                </Alert>
              )}
            </Box>

            {!badFile && !oldVersion && !fileMixUp && (
              <Typography
                sx={{
                  fontSize: 12,
                  float: "right",
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                {t("offline_note")}
              </Typography>
            )}
          </StepContent>
        </Step>

        <Step key={2}>
          <StepLabel
            StepIconProps={{
              sx: {
                "&.Mui-active": {
                  color: "#525252",
                },
                "&.Mui-completed": {
                  color: "#525252",
                },
              },
            }}
          >
            {decryptionMethod === "secretKey"
              ? t("enter_password_dec")
              : t("enter_keys_dec")}
          </StepLabel>
          <StepContent>
            {decryptionMethod === "secretKey" && (
              <TextField
                required
                type={showPassword ? "text" : "password"}
                error={wrongPassword ? true : false}
                id={
                  wrongPassword
                    ? "outlined-error-helper-text"
                    : "outlined-required"
                }
                className="decPasswordInput"
                label={wrongPassword ? t("error") : t("required")}
                helperText={wrongPassword ? t("wrong_password") : ""}
                placeholder={t("password")}
                variant="outlined"
                value={Password ? Password : ""}
                onChange={(e) => handlePasswordInput(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Tooltip title={t("show_password")} placement="left">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            )}

            {decryptionMethod === "publicKey" && (
              <>
                <TextField
                  id="public-key-input-dec"
                  required
                  error={wrongPublicKey || keysError ? true : false}
                  helperText={wrongPublicKey ? t("wrong_public_key") : ""}
                  label={t("sender_public_key")}
                  placeholder={t("enter_sender_public_key")}
                  variant="outlined"
                  value={PublicKey ? PublicKey : ""}
                  onChange={(e) => handlePublicKeyInput(e.target.value)}
                  fullWidth
                  style={{ marginBottom: "15px" }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <input
                          accept=".public"
                          style={{ display: "none" }}
                          id="dec-public-key-file"
                          type="file"
                          onChange={(e) => loadPublicKey(e.target.files[0])}
                        />
                        <label htmlFor="dec-public-key-file">
                          <Tooltip
                            title={t("load_public_key")}
                            placement="left"
                          >
                            <IconButton
                              aria-label={t("load_public_key")}
                              component="span"
                            >
                              <AttachFileIcon />
                            </IconButton>
                          </Tooltip>
                        </label>
                      </>
                    ),
                  }}
                />

                <TextField
                  id="private-key-input-dec"
                  type={showPrivateKey ? "text" : "password"}
                  required
                  error={wrongPrivateKey || keysError ? true : false}
                  helperText={wrongPrivateKey ? t("wrong_private_key") : ""}
                  label={t("your_private_key_dec")}
                  placeholder={t("enter_private_key_dec")}
                  variant="outlined"
                  value={PrivateKey ? PrivateKey : ""}
                  onChange={(e) => handlePrivateKeyInput(e.target.value)}
                  fullWidth
                  style={{ marginBottom: "15px" }}
                  InputProps={{
                    endAdornment: (
                      <>
                        {PrivateKey && (
                          <Tooltip
                            title={t("show_private_key")}
                            placement="left"
                          >
                            <IconButton
                              onClick={() => setShowPrivateKey(!showPrivateKey)}
                            >
                              {showPrivateKey ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}

                        <input
                          accept=".private"
                          style={{ display: "none" }}
                          id="dec-private-key-file"
                          type="file"
                          onChange={(e) => loadPrivateKey(e.target.files[0])}
                        />
                        <label htmlFor="dec-private-key-file">
                          <Tooltip
                            title={t("load_private_key")}
                            placement="left"
                          >
                            <IconButton
                              aria-label={t("load_private_key")}
                              component="span"
                            >
                              <AttachFileIcon />
                            </IconButton>
                          </Tooltip>
                        </label>
                      </>
                    ),
                  }}
                />
              </>
            )}

            <Box sx={{ marginBottom: "16px" }}>
              <div>
                <Grid container spacing={1}>
                  <Grid item>
                    <Button
                      disabled={
                        activeStep === 0 || isTestingPassword || isTestingKeys
                      }
                      onClick={handleBack}
                      sx={{
                        marginTop: "8px",
                        marginRight: "8px",
                        borderRadius: "8px",
                        backgroundColor: "#e9e9e9",
                      }}
                      fullWidth
                    >
                      {t("back")}
                    </Button>
                  </Grid>
                  <Grid item xs>
                    <Button
                      disabled={
                        (decryptionMethod === "secretKey" && !Password) ||
                        (decryptionMethod === "publicKey" &&
                          (!PublicKey || !PrivateKey)) ||
                        isTestingPassword ||
                        isTestingKeys
                      }
                      variant="contained"
                      onClick={testFilesDecryption}
                      className="nextBtnHs submitKeysDec"
                      sx={{
                        marginTop: "8px",
                        marginRight: "8px",
                        borderRadius: "8px",
                        backgroundColor: "#464653",
                        color: "#ffffff",
                        "&:hover": {
                          backgroundColor: "#3f3f3f",
                        },
                        transition: "color .01s",
                      }}
                      startIcon={
                        (isTestingPassword || isTestingKeys) && (
                          <CircularProgress size={24} />
                        )
                      }
                      fullWidth
                    >
                      {isTestingPassword
                        ? `${currFileState + 1}/${numberOfFiles} ${t(
                            "testing_password"
                          )}`
                        : isTestingKeys
                        ? `${currFileState + 1}/${numberOfFiles} ${t(
                            "testing_keys"
                          )}`
                        : t("next")}
                    </Button>
                  </Grid>
                </Grid>
                <br />

                {decryptionMethod === "secretKey" &&
                  Files.length > 1 &&
                  wrongPassword &&
                  !isTestingPassword && (
                    <Alert severity="error">
                      <strong>{Files[currFile].name}</strong>{" "}
                      {t("file_has_wrong_password")}
                    </Alert>
                  )}

                {decryptionMethod === "publicKey" && keysError && (
                  <Alert severity="error">{keysErrorMessage}</Alert>
                )}

                {decryptionMethod === "publicKey" &&
                  (wrongPrivateKey || wrongPublicKey) &&
                  !isTestingKeys &&
                  !keysError && (
                    <>
                      {Files.length > 1 && (
                        <Alert severity="error">
                          <strong>{Files[currFile].name}</strong>{" "}
                          {t("file_has_wrong_keys")}
                        </Alert>
                      )}
                    </>
                  )}
              </div>
            </Box>
          </StepContent>
        </Step>

        <Step key={3}>
          <StepLabel
            StepIconProps={{
              sx: {
                "&.Mui-active": {
                  color: "#525252",
                },
                "&.Mui-completed": {
                  color: "#525252",
                },
              },
            }}
          >
            {t("download_decrypted_files")}
          </StepLabel>

          <StepContent>
            {Files.length > 0 && (
              <Alert severity="success" icon={<LockOpenIcon />}>
                <strong>
                  {Files.length > 1 ? Files.length : Files[0].name}
                </strong>{" "}
                {Files.length > 1
                  ? t("files_ready_to_download")
                  : t("ready_to_download")}
              </Alert>
            )}

            <Box sx={{ marginBottom: "16px" }}>
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    disabled={activeStep === 0 || isDownloading}
                    onClick={handleBack}
                    sx={{
                      marginTop: "8px",
                      marginRight: "8px",
                      borderRadius: "8px",
                      backgroundColor: "#e9e9e9",
                    }}
                  >
                    {t("back")}
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button
                    disabled={
                      isDownloading ||
                      (!Password && !PublicKey && !PrivateKey) ||
                      Files.length === 0
                    }
                    variant="contained"
                    color="primary"
                    className="nextBtnHs downloadFileDec"
                    onClick={(e) => handleEncryptedFilesDownload(e)}
                    sx={{
                      marginTop: "8px",
                      marginRight: "8px",
                      borderRadius: "8px",
                      backgroundColor: "#464653",
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#3f3f3f",
                      },
                      transition: "color .01s",
                    }}
                    startIcon={
                      isDownloading ? (
                        <CircularProgress
                          size={24}
                          variant="determinate"
                          value={progress}
                        />
                      ) : (
                        <GetAppIcon />
                      )
                    }
                    fullWidth
                  >
                    {isDownloading
                      ? `${progress}% (${formatBytes(processedBytes)})`
                      : t("decrypted_files")}
                  </Button>
                </Grid>
              </Grid>
              <br />

              {isDownloading && (
                <Alert variant="outlined" severity="info">
                  {t("page_close_alert")}
                </Alert>
              )}
            </Box>
          </StepContent>
        </Step>
      </Stepper>
      {activeStep === 3 && (
        <Paper
          elevation={1}
          sx={{
            padding: "24px",
            boxShadow: "rgba(149, 157, 165, 0.4) 0px 8px 24px",
            borderRadius: "8px",
          }}
        >
          <Alert
            variant="outlined"
            severity="success"
            style={{ border: "none" }}
          >
            <AlertTitle>{t("success")}</AlertTitle>
            {t("success_downloaded_files_dec")}
          </Alert>

          <Button
            onClick={handleReset}
            sx={{
              marginTop: "8px",
              marginRight: "8px",
              borderRadius: "8px",
              border: "none",
              color: "#3f3f3f",
              backgroundColor: "#f3f3f3",
              "&:hover": {
                backgroundColor: "#e9e9e9",
              },
              transition: "background-color 0.2s ease-out",
            }}
            variant="outlined"
            startIcon={<RefreshIcon />}
            fullWidth
            style={{ textTransform: "none" }}
          >
            {t("decrypt_other_files")}
          </Button>
        </Paper>
      )}
    </Box>
  );
}
