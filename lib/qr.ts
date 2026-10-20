import QRCode from "qrcode";

/** Render a scannable QR as an inline SVG string (transparent background). */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0f2a1d", light: "#00000000" },
  });
}
