import axios from "axios";
import QRCode from "qrcode";
import sharp from "sharp";

interface GenerateQRCodeWithLogoOptions {
  walletAddress: string;
  logoPath: string;
  width?: number;
  margin?: number;
}

async function generateQRCodeWithLogo(
  options: GenerateQRCodeWithLogoOptions
): Promise<Buffer> {
  const { walletAddress, logoPath, width = 1000, margin = 4 } = options;

  try {
    const qrCodeBuffer = await QRCode.toBuffer(walletAddress, {
      width: width,
      margin: margin,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Process logo
    let logoBuffer: Buffer;
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      const response = await axios.get(logoPath, { responseType: 'arraybuffer' });
      logoBuffer = Buffer.from(response.data);
    } else {
      logoBuffer = await sharp(logoPath).toBuffer();
    }

    // Calculate sizes
    const logoSize = Math.floor(width * 0.2); 
    const whiteCircleSize = Math.floor(width * 0.3);

    // Create white circle background
    const whiteCircle = Buffer.from(
      `<svg><circle cx="${whiteCircleSize/2}" cy="${whiteCircleSize/2}" r="${whiteCircleSize/2}" fill="black"/></svg>`
    );

    // Resize and process the logo
    const processedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    // Add rounded corners to the QR code
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${width}" height="${width}" rx="50" ry="50"/></svg>`
    );

    // Composite QR code, white circle, logo, and rounded corners
    const qrCodeWithLogo = await sharp(qrCodeBuffer)
      .composite([
        {
          input: whiteCircle,
          top: Math.floor((width - whiteCircleSize) / 2),
          left: Math.floor((width - whiteCircleSize) / 2)
        },
        {
          input: processedLogo,
          top: Math.floor((width - logoSize) / 2),
          left: Math.floor((width - logoSize) / 2)
        },
        {
          input: roundedCorners,
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();

    return qrCodeWithLogo;
  } catch (error: any) {
    console.error("Error generating QR code with logo:", error);
    throw new Error(`Failed to generate QR code with logo: ${error.message}`);
  }
}

export default generateQRCodeWithLogo;
