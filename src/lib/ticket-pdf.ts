import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

type TicketForPdf = {
  ticketCode: string;
  qrToken: string;
  tierName: string;
  seatsCovered: number;
  buyerName: string;
};

/**
 * Builds a single PDF containing one page per ticket. Used when a buyer
 * purchases multiple tickets in one order — each page is a self-contained,
 * scannable ticket that can be printed or shown individually at the gate.
 */
export async function generateTicketsPdf(tickets: TicketForPdf[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const navy = rgb(0x0b / 255, 0x13 / 255, 0x2b / 255);
  const gold = rgb(0xd4 / 255, 0xaf / 255, 0x37 / 255);
  const grey = rgb(0x64 / 255, 0x74 / 255, 0x8b / 255);
  const cream = rgb(0xfa / 255, 0xf9 / 255, 0xf6 / 255);

  for (const ticket of tickets) {
    const page = pdfDoc.addPage([420, 620]);
    const { width, height } = page.getSize();

    // Background
    page.drawRectangle({ x: 0, y: 0, width, height, color: cream });

    // Header band
    page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: navy });
    page.drawText("FUL AWARD NIGHT 2026", {
      x: 32,
      y: height - 50,
      size: 18,
      font,
      color: gold
    });
    page.drawText("Mr & Miss FUL 2026", {
      x: 32,
      y: height - 72,
      size: 10,
      font: regularFont,
      color: rgb(1, 1, 1)
    });

    // QR code, embedded as PNG image
    const qrDataUrl = await QRCode.toDataURL(ticket.qrToken, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 500
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrSize = 240;
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: height - 90 - qrSize - 40,
      width: qrSize,
      height: qrSize
    });

    // Ticket code, centered beneath QR
    const codeWidth = font.widthOfTextAtSize(ticket.ticketCode, 20);
    page.drawText(ticket.ticketCode, {
      x: (width - codeWidth) / 2,
      y: height - 90 - qrSize - 70,
      size: 20,
      font,
      color: navy
    });

    // Details block
    let cursorY = height - 90 - qrSize - 110;
    const details: [string, string][] = [
      ["Ticket holder", ticket.buyerName],
      ["Ticket type", ticket.tierName],
      ["Admits", `${ticket.seatsCovered} guest${ticket.seatsCovered > 1 ? "s" : ""}`]
    ];

    for (const [label, value] of details) {
      page.drawText(label.toUpperCase(), {
        x: 32,
        y: cursorY,
        size: 9,
        font: regularFont,
        color: grey
      });
      page.drawText(value, {
        x: 32,
        y: cursorY - 16,
        size: 13,
        font,
        color: navy
      });
      cursorY -= 44;
    }

    // Divider
    page.drawLine({
      start: { x: 32, y: cursorY },
      end: { x: width - 32, y: cursorY },
      thickness: 1,
      color: rgb(0.88, 0.88, 0.85)
    });

    // Footer instruction
    page.drawText("Present this QR code at the entrance.", {
      x: 32,
      y: cursorY - 24,
      size: 10,
      font: regularFont,
      color: grey
    });
    page.drawText("Each ticket admits entry once only.", {
      x: 32,
      y: cursorY - 40,
      size: 10,
      font: regularFont,
      color: grey
    });

    // Gold accent line at very bottom
    page.drawRectangle({ x: 0, y: 0, width, height: 6, color: gold });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
