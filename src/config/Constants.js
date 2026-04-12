export const currentVersion = "3.0.2";
export const MAX_FILE_SIZE = 1024 * 1024 * 1024;
export const CHUNK_SIZE = 64 * 1024 * 1024;
export const crypto_secretstream_xchacha20poly1305_ABYTES = 17;
export const encoder = new TextEncoder();
export const decoder = new TextDecoder();
export const TRANSFER_CHUNK_SIZE = 64 * 1024; // 64KB for WebRTC Data Channel
export const SIGNALING_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "ws://localhost:3992"
    : `wss://${typeof window !== "undefined" ? window.location.hostname : ""}/signal`;
export const SIGNATURES = {
  v1: "Encrypted Using Hat.sh",
  v2_symmetric: "zDKO6XYXioc",
  v2_asymmetric: "hTWKbfoikeg",
};
