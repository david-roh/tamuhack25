import QRCode from 'qrcode';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}

export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  };

  try {
    const url = await QRCode.toDataURL(data, {
      ...defaultOptions,
      ...options,
    });
    return url;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate a unique claim token
export function generateClaimToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
} 