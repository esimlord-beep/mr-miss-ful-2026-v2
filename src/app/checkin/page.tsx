"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  QrCode,
  Camera,
  CameraOff,
} from "lucide-react";

type ScanResult = {
  success: boolean;
  message: string;
  ticket_code?: string;
  buyer_name?: string;
  tier_name?: string;
  seats_covered?: number;
  already_checked_in?: boolean;
  checked_in_at?: string;
};

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);

  async function handleScan(qrToken: string) {
    if (!qrToken.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qr_token: qrToken.trim(),
        }),
      });

      const data = await res.json();

      setResult(data);
      setToken("");
    } catch (error) {
      setResult({
        success: false,
        message: "Unable to connect to the check-in server.",
      });
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }

  // Just flips the flag on — the actual camera/scanner setup happens in the
  // effect below, once React has confirmed #qr-reader is in the DOM.
  function startScanner() {
    if (scanning) return;
    setResult(null);
    setCameraError(null);
    setScanning(true);
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.();
        // Only call stop() if the scanner is actually running — calling it
        // on an already-stopped/never-started instance throws.
        if (state === 2 /* Html5QrcodeScannerState.SCANNING */) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }

      scannerRef.current = null;
    }

    setScanning(false);
  }

  // Runs AFTER React has rendered the #qr-reader div (because it only runs
  // when `scanning` changes to true, which happens on the render after
  // setScanning(true) is called). This is what fixes the "element not
  // found" error — the previous version tried to start the scanner in the
  // same synchronous call that set scanning to true, before the div existed.
  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (cancelled) return;

        const el = document.getElementById("qr-reader");
        if (!el) {
          throw new Error("Scanner container not found in the page.");
        }

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText: string) => {
            await stopScanner();
            await handleScan(decodedText);
          },
          () => {
            // Ignore per-frame scan misses while camera is searching
          }
        );
      } catch (error) {
        console.error("Camera error:", error);

        if (cancelled) return;

        setScanning(false);

        const errName = error instanceof Error ? error.name : "";
        const errMessage = error instanceof Error ? error.message : String(error);

        let friendlyMessage = "Unable to access the camera. Please allow camera permission and try again.";
        if (errName === "NotAllowedError") {
          friendlyMessage = "Camera permission was denied. Go to Settings and allow camera access for this site.";
        } else if (errName === "NotFoundError") {
          friendlyMessage = "No camera was found on this device.";
        } else if (errName === "NotReadableError") {
          friendlyMessage = "Camera is already in use by another app. Close other apps using the camera and try again.";
        } else if (errName === "OverconstrainedError") {
          friendlyMessage = "This device doesn't support the requested camera mode.";
        } else if (location.protocol !== "https:") {
          friendlyMessage = "Camera access requires a secure (https) connection.";
        }

        setCameraError(`${friendlyMessage} (${errName || "Unknown"}: ${errMessage})`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scanning]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B132B] px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-sm">

        {/* HEADER */}
        <div className="text-center mb-8">
          <QrCode
            className="mx-auto text-[#D4AF37] mb-3"
            size={40}
          />

          <h1 className="text-2xl font-black text-white">
            Gate Check-In
          </h1>

          <p className="text-white/50 text-sm mt-1">
            Mr & Miss FUL Night 2026
          </p>
        </div>

        {/* CAMERA SCANNER */}
        {scanning && (
          <div className="bg-white/10 rounded-2xl p-4 mb-6">
            <div
              id="qr-reader"
              className="overflow-hidden rounded-xl"
            />

            <button
              onClick={stopScanner}
              className="w-full mt-4 rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-black text-white flex items-center justify-center gap-2"
            >
              <CameraOff size={18} />
              Stop Camera
            </button>
          </div>
        )}

        {/* SCAN BUTTON */}
        {!scanning && (
          <button
            onClick={startScanner}
            disabled={loading}
            className="w-full mb-4 rounded-full bg-[#D4AF37] px-6 py-4 text-sm font-black text-[#0B132B] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Camera size={20} />
            Scan QR Code
          </button>
        )}

        {cameraError && !scanning && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 font-semibold">
            {cameraError}
          </div>
        )}

        {/* MANUAL ENTRY */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <label className="block text-xs font-black uppercase tracking-widest text-white/50 mb-2">
            Enter QR Token Manually
          </label>

          <input
            ref={inputRef}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleScan(token)
            }
            placeholder="Enter QR token..."
            autoFocus
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white font-semibold outline-none focus:border-[#D4AF37] placeholder:text-white/30 mb-3"
          />

          <button
            onClick={() => handleScan(token)}
            disabled={loading || !token.trim()}
            className="w-full rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                className="animate-spin mx-auto"
                size={18}
              />
            ) : (
              "Check In Manually"
            )}
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div
            className={`rounded-2xl p-6 ${
              result.success
                ? "bg-green-500/10 border border-green-500/30"
                : result.already_checked_in
                ? "bg-amber-500/10 border border-amber-500/30"
                : "bg-rose-500/10 border border-rose-500/30"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.success ? (
                <CheckCircle
                  className="text-green-400 flex-shrink-0"
                  size={28}
                />
              ) : (
                <XCircle
                  className={
                    result.already_checked_in
                      ? "text-amber-400 flex-shrink-0"
                      : "text-rose-400 flex-shrink-0"
                  }
                  size={28}
                />
              )}

              <p
                className={`font-black text-lg ${
                  result.success
                    ? "text-green-400"
                    : result.already_checked_in
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {result.success
                  ? "Admitted!"
                  : result.already_checked_in
                  ? "Already Checked In"
                  : "Denied"}
              </p>
            </div>

            {result.buyer_name && (
              <div className="space-y-2">
                <p className="text-white font-black text-xl">
                  {result.buyer_name}
                </p>

                {result.tier_name && (
                  <p className="text-white/70 text-sm font-semibold">
                    {result.tier_name} · {result.seats_covered} seat
                    {(result.seats_covered ?? 1) > 1 ? "s" : ""}
                  </p>
                )}

                {result.ticket_code && (
                  <p className="text-white/50 text-xs font-mono">
                    {result.ticket_code}
                  </p>
                )}

                {result.already_checked_in &&
                  result.checked_in_at && (
                    <p className="text-amber-400 text-sm font-semibold">
                      Checked in at{" "}
                      {new Date(
                        result.checked_in_at
                      ).toLocaleTimeString("en-NG", {
                        timeStyle: "short",
                      })}
                    </p>
                  )}
              </div>
            )}

            <p className="text-white/60 text-sm mt-3">
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
