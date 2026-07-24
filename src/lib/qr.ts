import QRCode from "qrcode";

/**
 * Generates a QR code (as a base64 PNG data URL) encoding the given ticket's
 * qr_token. This is the ONLY value the Gate Check-In scanner looks up
 * (see /api/checkin/route.ts -> check_in_ticket RPC, which queries by
 * qr_token). Every place that shows a ticket to a buyer must encode this
 * same qr_token — never the human-readable ticket_code — or check-in will
 * fail with "Ticket not found or invalid QR code."
 */
export async function generateQrCodeDataUrl(qrToken: string): Promise<string> {
  return QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320
  });
}
