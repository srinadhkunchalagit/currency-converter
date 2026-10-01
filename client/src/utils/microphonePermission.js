// Microphone Permission & Speech Recognition Pre-Initialization Manager
// Handles Chrome (Desktop & Android) permission requests on startup,
// native getUserMedia triggers, and engine warm-up.

let permissionPromise = null;
let permissionState = "unknown"; // 'unknown' | 'granted' | 'denied' | 'unsupported'

export function getCachedPermissionState() {
  return permissionState;
}

/**
 * Requests microphone permission on app startup.
 * Prompts the browser's native permission dialog in Google Chrome (Desktop & Android).
 * Safe to call multiple times; executes only once per app load.
 */
export async function requestStartupMicrophonePermission() {
  if (permissionPromise) {
    return permissionPromise;
  }

  permissionPromise = (async () => {
    // 1. Check if browser supports mediaDevices
    if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      permissionState = "unsupported";
      return { status: "unsupported", message: "Media devices not supported in this browser." };
    }

    // 2. Check navigator.permissions query if available in Chrome
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permStatus = await navigator.permissions.query({ name: "microphone" });
        if (permStatus.state === "granted") {
          permissionState = "granted";
          warmUpSpeechRecognition();
          return { status: "granted" };
        } else if (permStatus.state === "denied") {
          permissionState = "denied";
          return { status: "denied", message: "Microphone permission is blocked in Chrome settings." };
        }
      } catch (e) {
        // Some browsers might not support query for microphone; proceed to getUserMedia
      }
    }

    // 3. Trigger native Chrome permission popup via getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop and release the tracks so the microphone hardware is not locked
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          /* ignore */
        }
      });

      permissionState = "granted";
      warmUpSpeechRecognition();
      return { status: "granted" };
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        permissionState = "denied";
        return {
          status: "denied",
          message:
            "Microphone permission was denied. In Chrome, please tap the lock icon 🔒 beside the website address and set Microphone to Allow.",
        };
      }
      permissionState = "denied";
      return { status: "denied", message: err.message || "Failed to access microphone." };
    }
  })();

  return permissionPromise;
}

/**
 * Warms up SpeechRecognition in the background so From/To buttons respond with zero lag.
 */
export function warmUpSpeechRecognition() {
  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!SpeechRecognition) return;

  try {
    const warmup = new SpeechRecognition();
    warmup.continuous = false;
    warmup.interimResults = false;
    // Do not call start() to avoid audio beeps, just instantiate to initialize WebKit audio pipeline
  } catch (e) {
    /* ignore */
  }
}
