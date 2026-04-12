import { useState, useEffect, useRef } from "react";
import { formatBytes } from "../helpers/formatBytes";
import { TRANSFER_CHUNK_SIZE, SIGNALING_URL } from "../config/Constants";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description";
import GetAppIcon from "@mui/icons-material/GetApp";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Divider from "@mui/material/Divider";
import { getTranslations as t } from "../../locales";

const _sodium = require("libsodium-wrappers-sumo");

function buildRtcConfig(turn) {
  const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  if (turn) {
    iceServers.push({
      urls: turn.urls,
      username: turn.username,
      credential: turn.credential,
    });
  }
  return { iceServers };
}

import { useRouter } from "next/router";

export default function TransferPanel() {
  const router = useRouter();
  const [mode, setMode] = useState("send");
  const [activeStep, setActiveStep] = useState(0);

  // Send state
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [peerConnected, setPeerConnected] = useState(false);

  // Receive state
  const [roomInput, setRoomInput] = useState("");

  // Transfer state
  const [progress, setProgress] = useState(0);
  const [processedBytes, setProcessedBytes] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [transferDone, setTransferDone] = useState(false);
  const [receivedFileName, setReceivedFileName] = useState("");
  const [downloadBlob, setDownloadBlob] = useState(null);

  // Error state
  const [errorMessage, setErrorMessage] = useState("");

  // Snackbar
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");

  // Server status
  const [serverStatus, setServerStatus] = useState("checking"); // "checking" | "online" | "offline"

  // Transfer history
  const [history, setHistory] = useState([]);

  // Refs for cleanup
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const isMountedRef = useRef(true);
  const turnRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("transferHistory");
      if (stored) setHistory(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // Auto-fill room code from URL query parameter
  useEffect(() => {
    if (router.query.room) {
      setMode("receive");
      setRoomInput(router.query.room);
    }
  }, [router.query.room]);

  // Check signaling server status
  useEffect(() => {
    const wsUrl = SIGNALING_URL.replace("wss://", "https://").replace("ws://", "http://");
    const checkStatus = () => {
      const ws = new WebSocket(SIGNALING_URL);
      const timeout = setTimeout(() => {
        ws.close();
        if (isMountedRef.current) setServerStatus("offline");
      }, 5000);
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        if (isMountedRef.current) setServerStatus("online");
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        if (isMountedRef.current) setServerStatus("offline");
      };
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupConnections();
    };
  }, []);

  const cleanupConnections = () => {
    if (dcRef.current) {
      try {
        dcRef.current.close();
      } catch (_) {}
      dcRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (_) {}
      pcRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
  };

  const handleReset = () => {
    cleanupConnections();
    setActiveStep(0);
    setFile(null);
    setPassword("");
    setShowPassword(false);
    setRoomCode("");
    setPeerConnected(false);
    setRoomInput("");
    setProgress(0);
    setProcessedBytes(0);
    setTotalSize(0);
    setTransferDone(false);
    setReceivedFileName("");
    setDownloadBlob(null);
    setErrorMessage("");
  };

  const addToHistory = (fileName, fileSize, direction) => {
    const entry = {
      name: fileName,
      size: fileSize,
      direction, // "sent" or "received"
      date: new Date().toISOString(),
    };
    const updated = [entry, ...history].slice(0, 20); // keep last 20
    setHistory(updated);
    try {
      localStorage.setItem("transferHistory", JSON.stringify(updated));
    } catch (_) {}
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("transferHistory");
  };

  const handleModeChange = (newMode) => {
    handleReset();
    setMode(newMode);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setErrorMessage("");
  };

  const showSnackBar = (message) => {
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    showSnackBar("Room code copied to clipboard");
  };

  const copyShareLink = () => {
    const link = window.location.origin + "/?tab=transfer&room=" + roomCode;
    navigator.clipboard.writeText(link);
    showSnackBar("Link copied to clipboard");
  };

  // ─── File input handler ────────────────────────────────────────────────────

  const handleFileInput = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  // ─── Password validation ──────────────────────────────────────────────────

  const isPasswordValid = () => {
    return password.length >= 6;
  };

  // ─── Derive key from password + salt ──────────────────────────────────────

  const deriveKey = async (pwd, salt) => {
    await _sodium.ready;
    const sodium = _sodium;
    const key = sodium.crypto_pwhash(
      sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES,
      pwd,
      salt,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    );
    return key;
  };

  // ─── SENDER FLOW ─────────────────────────────────────────────────────────

  const startSender = () => {
    if (!isPasswordValid()) return;

    handleNext(); // go to step 3 (Share room code)

    const ws = new WebSocket(SIGNALING_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "create" }));
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "room-created":
          setRoomCode(msg.room);
          turnRef.current = msg.turn || null;
          break;

        case "peer-joined":
          setPeerConnected(true);
          setupSenderPeerConnection(ws);
          break;

        case "signal":
          handleSenderSignal(msg.data);
          break;

        case "peer-disconnected":
          setErrorMessage("Peer disconnected");
          break;

        case "error":
          setErrorMessage(msg.message || "Signaling error");
          break;
      }
    };

    ws.onerror = () => {
      if (!isMountedRef.current) return;
      setErrorMessage("Connection to signaling server failed");
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      if (!transferDone) {
        // Only show error if we didn't finish
      }
    };
  };

  const setupSenderPeerConnection = (ws) => {
    const pc = new RTCPeerConnection(buildRtcConfig(turnRef.current));
    pcRef.current = pc;

    const dc = pc.createDataChannel("fileTransfer", {
      ordered: true,
    });
    dc.binaryType = "arraybuffer";
    dc.bufferedAmountLowThreshold = 256 * 1024;
    dcRef.current = dc;

    dc.onopen = () => {
      if (!isMountedRef.current) return;
      // Auto-advance to transfer step
      setActiveStep(3);
      sendFile(dc);
    };

    dc.onerror = (e) => {
      if (!isMountedRef.current) return;
      setErrorMessage("Data channel error: " + (e.error?.message || "unknown"));
    };

    dc.onclose = () => {
      if (!isMountedRef.current) return;
      if (!transferDone) {
        setErrorMessage("Peer disconnected during transfer");
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "signal",
            data: { candidate: e.candidate },
          })
        );
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed"
      ) {
        if (!isMountedRef.current) return;
        if (!transferDone) {
          setErrorMessage("Peer connection lost");
        }
      }
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        ws.send(
          JSON.stringify({
            type: "signal",
            data: pc.localDescription,
          })
        );
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setErrorMessage("Failed to create offer: " + err.message);
      });
  };

  const handleSenderSignal = (data) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (data.candidate) {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
    } else if (data.type === "answer") {
      pc.setRemoteDescription(new RTCSessionDescription(data)).catch((err) => {
        if (!isMountedRef.current) return;
        setErrorMessage("Failed to set remote description: " + err.message);
      });
    }
  };

  const sendFile = async (dc) => {
    try {
      await _sodium.ready;
      const sodium = _sodium;

      const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
      const key = await deriveKey(password, salt);

      const { state, header } =
        sodium.crypto_secretstream_xchacha20poly1305_init_push(key);

      // Send metadata as JSON
      const meta = JSON.stringify({
        type: "meta",
        name: file.name,
        size: file.size,
      });
      dc.send(meta);

      // Send salt + header as binary (salt: 16 bytes, header: 24 bytes = 40 bytes)
      const saltHeader = new Uint8Array(salt.length + header.length);
      saltHeader.set(salt, 0);
      saltHeader.set(header, salt.length);
      dc.send(saltHeader.buffer);

      // Read and encrypt file in chunks
      const fileSize = file.size;
      setTotalSize(fileSize);
      let offset = 0;

      const readChunk = (start, end) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(new Uint8Array(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file.slice(start, end));
        });
      };

      const sendNextChunk = async () => {
        if (!isMountedRef.current) return;

        const end = Math.min(offset + TRANSFER_CHUNK_SIZE, fileSize);
        const chunk = await readChunk(offset, end);
        const isLast = end >= fileSize;

        const tag = isLast
          ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
          : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;

        const encryptedChunk =
          sodium.crypto_secretstream_xchacha20poly1305_push(
            state,
            chunk,
            null,
            tag
          );

        // Flow control: wait if buffer is full
        const sendWhenReady = () => {
          if (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
            dc.onbufferedamountlow = () => {
              dc.onbufferedamountlow = null;
              dc.send(encryptedChunk.buffer);
              afterSend();
            };
          } else {
            dc.send(encryptedChunk.buffer);
            afterSend();
          }
        };

        const afterSend = () => {
          offset = end;
          if (isMountedRef.current) {
            setProcessedBytes(offset);
            setProgress(Math.round((offset / fileSize) * 100));
          }

          if (isLast) {
            if (isMountedRef.current) {
              setTransferDone(true);
              addToHistory(file.name, file.size, "sent");
            }
          } else {
            sendNextChunk();
          }
        };

        sendWhenReady();
      };

      await sendNextChunk();
    } catch (err) {
      if (!isMountedRef.current) return;
      setErrorMessage("Encryption error: " + err.message);
    }
  };

  // ─── RECEIVER FLOW ───────────────────────────────────────────────────────

  const startReceiver = () => {
    if (!isPasswordValid()) return;

    handleNext(); // go to step 3 (Transfer)

    const ws = new WebSocket(SIGNALING_URL);
    wsRef.current = ws;

    // Receiver state tracked via refs to avoid stale closures
    const receiverState = {
      meta: null,
      headerReceived: false,
      pullState: null,
      receivedChunks: [],
      receivedSize: 0,
      fileSize: 0,
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room: roomInput.trim() }));
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "joined":
          turnRef.current = msg.turn || null;
          setupReceiverPeerConnection(ws, receiverState);
          break;

        case "signal":
          handleReceiverSignal(msg.data, ws);
          break;

        case "peer-disconnected":
          setErrorMessage("Peer disconnected");
          break;

        case "error":
          setErrorMessage(msg.message || "Failed to join room");
          break;
      }
    };

    ws.onerror = () => {
      if (!isMountedRef.current) return;
      setErrorMessage("Connection to signaling server failed");
    };

    ws.onclose = () => {};
  };

  const setupReceiverPeerConnection = (ws, receiverState) => {
    const pc = new RTCPeerConnection(buildRtcConfig(turnRef.current));
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "signal",
            data: { candidate: e.candidate },
          })
        );
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed"
      ) {
        if (!isMountedRef.current) return;
        if (!receiverState.meta || receiverState.receivedSize < receiverState.fileSize) {
          setErrorMessage("Peer connection lost");
        }
      }
    };

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      dc.binaryType = "arraybuffer";
      dcRef.current = dc;

      dc.onmessage = async (e) => {
        if (!isMountedRef.current) return;

        try {
          await _sodium.ready;
          const sodium = _sodium;

          // First message: meta (JSON string)
          if (!receiverState.meta) {
            const meta = JSON.parse(e.data);
            receiverState.meta = meta;
            receiverState.fileSize = meta.size;
            receiverState.fileName = meta.name;
            setReceivedFileName(meta.name);
            setTotalSize(meta.size);
            return;
          }

          // Second message: salt (16 bytes) + header (24 bytes)
          if (!receiverState.headerReceived) {
            const combined = new Uint8Array(e.data);
            const saltLen = sodium.crypto_pwhash_SALTBYTES; // 16
            const salt = combined.slice(0, saltLen);
            const header = combined.slice(saltLen);

            try {
              const key = await deriveKey(password, salt);
              receiverState.pullState =
                sodium.crypto_secretstream_xchacha20poly1305_init_pull(
                  header,
                  key
                );
              receiverState.headerReceived = true;
            } catch (err) {
              setErrorMessage(
                "Decryption failed - wrong password or corrupted data"
              );
              return;
            }
            return;
          }

          // Subsequent messages: encrypted chunks
          const encryptedChunk = new Uint8Array(e.data);
          try {
            const result =
              sodium.crypto_secretstream_xchacha20poly1305_pull(
                receiverState.pullState,
                encryptedChunk
              );

            if (!result) {
              setErrorMessage(
                "Decryption failed - wrong password or corrupted data"
              );
              return;
            }

            const { message, tag } = result;
            receiverState.receivedChunks.push(message);
            receiverState.receivedSize += message.length;

            setProcessedBytes(receiverState.receivedSize);
            setProgress(
              Math.round(
                (receiverState.receivedSize / receiverState.fileSize) * 100
              )
            );

            // Check for final tag
            if (
              tag ===
              sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
            ) {
              const blob = new Blob(receiverState.receivedChunks);
              setDownloadBlob(blob);
              setTransferDone(true);
              addToHistory(receiverState.fileName, receiverState.fileSize, "received");
            }
          } catch (err) {
            setErrorMessage(
              "Decryption failed - wrong password or corrupted data"
            );
          }
        } catch (err) {
          setErrorMessage("Transfer error: " + err.message);
        }
      };

      dc.onerror = (e) => {
        if (!isMountedRef.current) return;
        setErrorMessage(
          "Data channel error: " + (e.error?.message || "unknown")
        );
      };

      dc.onclose = () => {
        if (!isMountedRef.current) return;
        if (receiverState.receivedSize < receiverState.fileSize) {
          setErrorMessage("Peer disconnected during transfer");
        }
      };
    };
  };

  const handleReceiverSignal = (data, ws) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (data.candidate) {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
    } else if (data.type === "offer") {
      pc.setRemoteDescription(new RTCSessionDescription(data))
        .then(() => pc.createAnswer())
        .then((answer) => pc.setLocalDescription(answer))
        .then(() => {
          ws.send(
            JSON.stringify({
              type: "signal",
              data: pc.localDescription,
            })
          );
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          setErrorMessage("Failed to create answer: " + err.message);
        });
    }
  };

  // ─── Download handler for receiver ────────────────────────────────────────

  const handleDownload = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = receivedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Styling constants ────────────────────────────────────────────────────

  const stepIconSx = {
    "&.Mui-active": {
      color: "#525252",
    },
    "&.Mui-completed": {
      color: "#525252",
    },
  };

  const primaryButtonSx = {
    marginTop: "8px",
    marginRight: "8px",
    borderRadius: "8px",
    backgroundColor: "#464653",
    color: "#ffffff",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#3f3f3f",
    },
    transition: "color .01s",
  };

  const backButtonSx = {
    marginTop: "8px",
    marginRight: "8px",
    borderRadius: "8px",
    backgroundColor: "#e9e9e9",
    textTransform: "none",
    transition: "color .01s",
  };

  // ─── Render: Send Mode Steps ──────────────────────────────────────────────

  const renderSendSteps = () => (
    <Stepper
      activeStep={activeStep}
      orientation="vertical"
      sx={{
        color: "#3f3f3f",
        backgroundColor: "transparent",
      }}
    >
      {/* Step 1: Choose file */}
      <Step key={1}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Choose a file
        </StepLabel>
        <StepContent>
          <div
            style={{
              padding: "20px",
              border: "5px dashed",
              borderColor: "#ebebeb",
              borderRadius: "14px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {file ? (
              <Box
                sx={{
                  backgroundColor: "#f3f3f3",
                  borderRadius: "8px",
                  padding: "15px",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.54)" }}>
                  {formatBytes(file.size)}
                </Typography>
              </Box>
            ) : (
              <Typography
                sx={{ color: "rgba(0,0,0,0.54)", marginBottom: "10px" }}
              >
                Select a file to send
              </Typography>
            )}

            <input
              style={{ display: "none" }}
              id="transfer-file"
              type="file"
              onChange={handleFileInput}
            />
            <label htmlFor="transfer-file">
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
                startIcon={<DescriptionIcon />}
              >
                {file ? "Change file" : t("browse_files") || "Browse file"}
              </Button>
            </label>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Button
              fullWidth
              disabled={!file}
              variant="contained"
              onClick={handleNext}
              sx={primaryButtonSx}
            >
              {t("next") || "Next"}
            </Button>
          </div>
        </StepContent>
      </Step>

      {/* Step 2: Enter password */}
      <Step key={2}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Enter password
        </StepLabel>
        <StepContent>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            size="small"
            error={password.length > 0 && password.length < 6}
            helperText={
              password.length > 0 && password.length < 6
                ? "Password must be at least 6 characters"
                : "Both sender and receiver must use the same password"
            }
            sx={{ marginBottom: "10px" }}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              },
            }}
          />

          <div style={{ marginBottom: "16px" }}>
            <Button
              fullWidth
              disabled={!isPasswordValid()}
              variant="contained"
              onClick={startSender}
              sx={primaryButtonSx}
            >
              Create room
            </Button>
            <Button onClick={handleBack} sx={backButtonSx}>
              {t("back") || "Back"}
            </Button>
          </div>
        </StepContent>
      </Step>

      {/* Step 3: Share room code */}
      <Step key={3}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Share room code
        </StepLabel>
        <StepContent>
          {roomCode ? (
            <Box sx={{ textAlign: "center", marginBottom: "16px" }}>
              <Box
                sx={{
                  backgroundColor: "#f3f3f3",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    userSelect: "all",
                  }}
                >
                  {roomCode}
                </Typography>
                <IconButton onClick={copyRoomCode} size="small" title="Copy code">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Button
                onClick={copyShareLink}
                size="small"
                startIcon={<ContentCopyIcon />}
                sx={{
                  textTransform: "none",
                  color: "rgba(0,0,0,0.54)",
                  fontSize: 12,
                  mb: "8px",
                }}
              >
                Copy share link
              </Button>

              {!peerConnected ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <CircularProgress size={20} sx={{ color: "#525252" }} />
                  <Typography sx={{ color: "rgba(0,0,0,0.54)" }}>
                    Waiting for peer to connect...
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: "#2e7d32" }}>
                  Peer connected! Starting transfer...
                </Typography>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "20px",
              }}
            >
              <CircularProgress size={20} sx={{ color: "#525252" }} />
              <Typography sx={{ color: "rgba(0,0,0,0.54)" }}>
                Creating room...
              </Typography>
            </Box>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: "10px" }}>
              {errorMessage}
            </Alert>
          )}
        </StepContent>
      </Step>

      {/* Step 4: Transfer */}
      <Step key={4}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Transfer
        </StepLabel>
        <StepContent>
          <Box sx={{ textAlign: "center", padding: "20px" }}>
            {!transferDone ? (
              <>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={progress}
                    size={100}
                    thickness={4}
                    sx={{ color: "#464653" }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "rgba(0,0,0,0.54)" }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    marginTop: "12px",
                    color: "rgba(0,0,0,0.54)",
                  }}
                >
                  Sending {formatBytes(processedBytes)} /{" "}
                  {formatBytes(totalSize)}
                </Typography>
              </>
            ) : (
              <>
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 60, color: "#2e7d32", marginBottom: "10px" }}
                />
                <Typography variant="h6" sx={{ marginBottom: "5px" }}>
                  Transfer complete!
                </Typography>
                <Typography sx={{ color: "rgba(0,0,0,0.54)" }}>
                  {file?.name} ({formatBytes(file?.size)}) sent successfully
                </Typography>
              </>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ marginTop: "15px" }}>
                {errorMessage}
              </Alert>
            )}
          </Box>
        </StepContent>
      </Step>
    </Stepper>
  );

  // ─── Render: Receive Mode Steps ───────────────────────────────────────────

  const renderReceiveSteps = () => (
    <Stepper
      activeStep={activeStep}
      orientation="vertical"
      sx={{
        color: "#3f3f3f",
        backgroundColor: "transparent",
      }}
    >
      {/* Step 1: Enter room code */}
      <Step key={1}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Enter room code
        </StepLabel>
        <StepContent>
          <TextField
            fullWidth
            label="Room code"
            placeholder="Enter the 3-word room code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ marginBottom: "10px" }}
          />

          <div style={{ marginBottom: "16px" }}>
            <Button
              fullWidth
              disabled={!roomInput.trim()}
              variant="contained"
              onClick={handleNext}
              sx={primaryButtonSx}
            >
              {t("next") || "Next"}
            </Button>
          </div>
        </StepContent>
      </Step>

      {/* Step 2: Enter password */}
      <Step key={2}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Enter password
        </StepLabel>
        <StepContent>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter the shared password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            size="small"
            error={password.length > 0 && password.length < 6}
            helperText={
              password.length > 0 && password.length < 6
                ? "Password must be at least 6 characters"
                : "Use the same password the sender used"
            }
            sx={{ marginBottom: "10px" }}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              },
            }}
          />

          <div style={{ marginBottom: "16px" }}>
            <Button
              fullWidth
              disabled={!isPasswordValid()}
              variant="contained"
              onClick={startReceiver}
              sx={primaryButtonSx}
            >
              Join room
            </Button>
            <Button onClick={handleBack} sx={backButtonSx}>
              {t("back") || "Back"}
            </Button>
          </div>
        </StepContent>
      </Step>

      {/* Step 3: Transfer */}
      <Step key={3}>
        <StepLabel StepIconProps={{ sx: stepIconSx }}>
          Transfer
        </StepLabel>
        <StepContent>
          <Box sx={{ textAlign: "center", padding: "20px" }}>
            {!transferDone ? (
              <>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={progress}
                    size={100}
                    thickness={4}
                    sx={{ color: "#464653" }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "rgba(0,0,0,0.54)" }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    marginTop: "12px",
                    color: "rgba(0,0,0,0.54)",
                  }}
                >
                  {totalSize > 0
                    ? `Receiving ${formatBytes(processedBytes)} / ${formatBytes(totalSize)}`
                    : "Waiting for data..."}
                </Typography>
              </>
            ) : (
              <>
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 60, color: "#2e7d32", marginBottom: "10px" }}
                />
                <Typography variant="h6" sx={{ marginBottom: "5px" }}>
                  Transfer complete!
                </Typography>
                <Typography
                  sx={{ color: "rgba(0,0,0,0.54)", marginBottom: "15px" }}
                >
                  {receivedFileName} ({formatBytes(totalSize)})
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  startIcon={<GetAppIcon />}
                  sx={primaryButtonSx}
                >
                  Download file
                </Button>
              </>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ marginTop: "15px" }}>
                {errorMessage}
              </Alert>
            )}
          </Box>
        </StepContent>
      </Step>
    </Stepper>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div style={{ width: "100%" }}>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={snackBarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(false)}
      >
        <Alert severity="success">{snackBarMessage}</Alert>
      </Snackbar>

      {/* Mode toggle */}
      <FormControl
        component="fieldset"
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <RadioGroup
          row
          value={mode}
          aria-label="transfer mode"
          sx={{ justifyContent: "center" }}
        >
          <FormControlLabel
            value="send"
            control={<Radio color="default" />}
            label="Send"
            labelPlacement="end"
            onChange={() => handleModeChange("send")}
          />
          <FormControlLabel
            value="receive"
            control={<Radio color="default" />}
            label="Receive"
            labelPlacement="end"
            onChange={() => handleModeChange("receive")}
          />
        </RadioGroup>
      </FormControl>

      {/* Steps */}
      {mode === "send" ? renderSendSteps() : renderReceiveSteps()}

      {/* Reset button - shown after step 0 or on error */}
      {(activeStep > 0 || errorMessage) && (
        <Box sx={{ textAlign: "center", marginTop: "15px" }}>
          <Button
            onClick={handleReset}
            sx={{
              padding: "8px",
              paddingLeft: "20px",
              paddingRight: "20px",
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
          >
            {t("reset") || "Start over"}
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: "15px",
          px: "4px",
        }}
      >
        <Chip
          size="small"
          label={
            serverStatus === "checking"
              ? "Checking server..."
              : serverStatus === "online"
              ? "Server online"
              : "Server offline"
          }
          sx={{
            backgroundColor:
              serverStatus === "online"
                ? "#e8f5e9"
                : serverStatus === "offline"
                ? "#fdecea"
                : "#f3f3f3",
            color:
              serverStatus === "online"
                ? "#2e7d32"
                : serverStatus === "offline"
                ? "#611a15"
                : "rgba(0,0,0,0.54)",
            fontSize: 11,
          }}
        />
        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(0, 0, 0, 0.54)",
          }}
        >
          End-to-end encrypted
        </Typography>
      </Box>

      {history.length > 0 && (
        <Box sx={{ mt: "20px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "8px",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(0,0,0,0.54)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <HistoryIcon sx={{ fontSize: 16 }} />
              Transfer History
            </Typography>
            <Button
              size="small"
              onClick={clearHistory}
              sx={{
                fontSize: 11,
                textTransform: "none",
                color: "rgba(0,0,0,0.4)",
              }}
            >
              Clear
            </Button>
          </Box>
          <List
            dense
            sx={{
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            {history.map((entry, i) => (
              <ListItem key={i} sx={{ py: "2px" }}>
                <ListItemText
                  primary={entry.name}
                  secondary={`${formatBytes(entry.size)} · ${
                    entry.direction === "sent" ? "Sent" : "Received"
                  } · ${new Date(entry.date).toLocaleString()}`}
                  primaryTypographyProps={{ fontSize: 13, noWrap: true }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </div>
  );
}
