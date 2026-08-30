import QRCode from 'qrcode';

export interface PixPayloadParams {
  pixKey: string;
  pixKeyType?: 'CPF/CNPJ' | 'Celular' | 'E-mail' | 'Chave Aleatória' | string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txId?: string;
  description?: string;
}

/**
 * Remove accents and special characters from string
 */
function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
}

/**
 * Format string as EMV TLV (Tag-Length-Value)
 */
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * CRC16-CCITT (0xFFFF polynomial 0x1021) algorithm as mandated by BACEN
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Normalize Pix Key based on type
 */
export function normalizePixKey(key: string, keyType?: string): string {
  const clean = key.trim();
  if (!clean) return '';

  // Phone normalization: ensure international +55 prefix if Brazilian mobile
  if (keyType === 'Celular' || /^\+?\d{10,13}$/.test(clean.replace(/\D/g, ''))) {
    const digits = clean.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) {
      return `+55${digits}`;
    }
    if (digits.length === 12 || digits.length === 13) {
      return `+${digits}`;
    }
  }

  // CPF or CNPJ: remove dots, dashes and slashes
  if (keyType === 'CPF/CNPJ' || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(clean) || /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(clean)) {
    const digits = clean.replace(/\D/g, '');
    if (digits.length === 11 || digits.length === 14) {
      return digits;
    }
  }

  return clean;
}

/**
 * Generates the official BACEN BR Code EMV Payload (Pix Copia e Cola)
 */
export function generatePixPayload(params: PixPayloadParams): string {
  const {
    pixKey,
    pixKeyType,
    merchantName = 'NATURALIS GOURMET',
    merchantCity = 'OLIMPIA',
    amount = 0,
    txId = '***',
    description
  } = params;

  const normalizedKey = normalizePixKey(pixKey, pixKeyType);
  if (!normalizedKey) {
    return '';
  }

  // Normalize Merchant Name (max 25 chars, uppercase, alphanumeric)
  const normName = removeAccents(merchantName).toUpperCase().slice(0, 25) || 'NATURALIS GOURMET';
  
  // Normalize Merchant City (max 15 chars, uppercase, alphanumeric)
  const normCity = removeAccents(merchantCity.replace(/-\s*[A-Z]{2}$/i, '')).toUpperCase().slice(0, 15) || 'OLIMPIA';

  // Normalize TxID (max 25 chars, alphanumeric without spaces, default ***)
  const cleanTxId = txId ? txId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) : '***';
  const finalTxId = cleanTxId.length > 0 ? cleanTxId : '***';

  // 1. Payload Format Indicator (00)
  let payload = formatEMV('00', '01');

  // 2. Point of Initiation Method (01) -> 12 = Dynamic, 11 = Static. Static is default standard for offline/store keys
  // BACEN standard uses Static 11 for merchant keys with amount
  // (leaving omitted or using standard static 12 when QR is one-time)
  // Payload Format Indicator 01 = 12 (Dynamic QR / Single Use) or omitted for standard static

  // 3. Merchant Account Information (26)
  let merchantAccount = formatEMV('00', 'br.gov.bcb.pix');
  merchantAccount += formatEMV('01', normalizedKey);
  if (description) {
    const normDesc = removeAccents(description).slice(0, 40);
    if (normDesc) {
      merchantAccount += formatEMV('02', normDesc);
    }
  }
  payload += formatEMV('26', merchantAccount);

  // 4. Merchant Category Code (52)
  payload += formatEMV('52', '0000');

  // 5. Transaction Currency (53) -> 986 = BRL
  payload += formatEMV('53', '986');

  // 6. Transaction Amount (54)
  if (typeof amount === 'number' && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatEMV('54', formattedAmount);
  }

  // 7. Country Code (58)
  payload += formatEMV('58', 'BR');

  // 8. Merchant Name (59)
  payload += formatEMV('59', normName);

  // 9. Merchant City (60)
  payload += formatEMV('60', normCity);

  // 10. Additional Data Field Template (62) -> TxID (05)
  const additionalData = formatEMV('05', finalTxId);
  payload += formatEMV('62', additionalData);

  // 11. CRC16 (63)
  const payloadWithCRCHeader = payload + '6304';
  const crc = calculateCRC16(payloadWithCRCHeader);

  return payloadWithCRCHeader + crc;
}

/**
 * Generates high quality Data URL (base64 image) for QR Code
 */
export async function generatePixQrCodeDataUrl(
  pixPayload: string,
  width: number = 320
): Promise<string> {
  if (!pixPayload) return '';
  try {
    return await QRCode.toDataURL(pixPayload, {
      width,
      margin: 1.5,
      color: {
        dark: '#0f172a', // Deep slate for high contrast & fast scanning
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Error generating Pix QR Code Data URL:', err);
    return '';
  }
}

/**
 * Generates vector SVG string for QR Code
 */
export async function generatePixQrCodeSvg(
  pixPayload: string,
  width: number = 280
): Promise<string> {
  if (!pixPayload) return '';
  try {
    return await QRCode.toString(pixPayload, {
      type: 'svg',
      width,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Error generating Pix QR Code SVG:', err);
    return '';
  }
}
