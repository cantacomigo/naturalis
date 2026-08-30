import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency, formatPhoneDisplay } from '../utils/whatsapp';
import { generatePixPayload, generatePixQrCodeDataUrl } from '../utils/pixPayload';

interface PixInlineCardProps {
  amount: number;
  orderId?: string;
  storeSettings: StoreSettings;
  compact?: boolean;
  showSteps?: boolean;
  showDownload?: boolean;
  onOpenWhatsAppReceipt?: () => void;
  onEnlargeQrCode?: (qrUrl: string, payload: string) => void;
}

export const PixInlineCard: React.FC<PixInlineCardProps> = ({
  amount,
  orderId,
  storeSettings,
  compact = false,
  showSteps = true,
  showDownload = true,
  onOpenWhatsAppReceipt,
  onEnlargeQrCode,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [isLoadingQr, setIsLoadingQr] = useState(true);

  // Merchant info with fallback
  const pixKey = storeSettings?.pixKey || '11999998888';
  const pixKeyType = storeSettings?.pixKeyType || 'Celular';
  const pixName = storeSettings?.pixName || storeSettings?.storeName || 'Naturalis Gourmet';
  const pixCity = storeSettings?.city || 'Olímpia';
  const txId = orderId ? `NAT${orderId}` : 'NATURALIS';

  // Compute PIX BR Code Payload & QR Code on mount or changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingQr(true);

    try {
      const payload = generatePixPayload({
        pixKey,
        pixKeyType,
        merchantName: pixName,
        merchantCity: pixCity,
        amount: amount > 0 ? amount : undefined,
        txId,
        description: `Pedido ${orderId ? `#${orderId}` : 'Naturalis'}`
      });

      setPixPayload(payload);

      generatePixQrCodeDataUrl(payload, 340).then((url) => {
        if (isMounted) {
          setQrCodeDataUrl(url);
          setIsLoadingQr(false);
        }
      });
    } catch (err) {
      console.error('Error generating pix:', err);
      if (isMounted) setIsLoadingQr(false);
    }

    return () => {
      isMounted = false;
    };
  }, [pixKey, pixKeyType, pixName, pixCity, amount, txId, orderId]);

  const handleCopyPayload = () => {
    if (pixPayload && navigator.clipboard) {
      navigator.clipboard.writeText(pixPayload);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handleCopyKey = () => {
    if (pixKey && navigator.clipboard) {
      navigator.clipboard.writeText(pixKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2200);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `qrcode_pix_naturalis_${orderId || 'pedido'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50/90 to-teal-50/40 rounded-2xl sm:rounded-3xl border border-emerald-200/90 p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 border-b border-emerald-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                PIX Online Automático
              </h3>
              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5" />
                Imediato
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              Escaneie o QR Code ou use o Pix Copia e Cola
            </p>
          </div>
        </div>

        {/* Amount Badge */}
        <div className="text-right">
          <span className="text-[10px] text-stone-500 font-semibold block uppercase tracking-wider">
            Total a Pagar
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-700">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Center QR Code and Copy Section */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Visual QR Code Display */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div 
            className="relative p-2.5 bg-white rounded-2xl border-2 border-emerald-300 shadow-md group cursor-pointer"
            onClick={() => onEnlargeQrCode && onEnlargeQrCode(qrCodeDataUrl, pixPayload)}
            title="Clique para ampliar o QR Code"
          >
            {isLoadingQr ? (
              <div className="w-40 h-40 flex flex-col items-center justify-center bg-stone-50 rounded-xl text-emerald-600 gap-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-bold text-stone-500">Gerando QR Code...</span>
              </div>
            ) : qrCodeDataUrl ? (
              <>
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code Pix Naturalis Gourmet" 
                  className="w-40 h-40 object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-stone-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-2xs">
                  <Maximize2 className="w-6 h-6 text-white" />
                  <span className="text-[11px] font-extrabold">Ampliar</span>
                </div>
              </>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-stone-400 text-xs">
                QR Indisponível
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              Aponte a câmera do seu banco
            </span>
            {showDownload && qrCodeDataUrl && (
              <button
                type="button"
                onClick={handleDownloadQr}
                className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Baixar imagem do QR Code"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Copy & Paste Code + Key Info */}
        <div className="sm:col-span-7 space-y-2.5">
          {/* Main Pix Copia e Cola Big Button */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Código Pix Copia e Cola (BACEN Oficial)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={pixPayload || 'Gerando código Pix...'}
                onClick={handleCopyPayload}
                className="w-full bg-white border border-emerald-300 rounded-xl pl-3 pr-24 py-2.5 text-xs font-mono text-stone-700 select-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={handleCopyPayload}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                  copiedCode 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                id="copy-pix-payload-btn"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            {copiedCode && (
              <p className="text-[11px] font-bold text-emerald-800 animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Código Pix copiado com sucesso! Cole no app do seu banco.
              </p>
            )}
          </div>

          {/* Simple Key fallback */}
          <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-stone-500 font-semibold block">
                Ou use a Chave direta ({pixKeyType}):
              </span>
              <span className="font-mono font-extrabold text-emerald-900 truncate block">
                {pixKey}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyKey}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 flex items-center gap-1 cursor-pointer shrink-0"
              title="Copiar apenas a chave Pix"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-emerald-700" />}
              <span>{copiedKey ? 'Copiado' : 'Copiar Chave'}</span>
            </button>
          </div>

          {/* Receiver Info Summary */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200/60">
            <div>
              <span className="text-[10px] text-stone-500 font-semibold block">Beneficiário:</span>
              <span className="font-bold text-stone-900 truncate block">{pixName}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-semibold block">Identificador (TxID):</span>
              <span className="font-mono font-bold text-emerald-800 truncate block">#{txId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Guide (if not compact) */}
      {showSteps && (
        <div className="pt-3 border-t border-emerald-200/80 space-y-2">
          <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
            Como pagar em 3 passos simples:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p className="text-stone-700 text-[11px] leading-snug">
                Abra o app do seu banco e escolha <strong>Pix</strong> &gt; <strong>Pagar com QR Code</strong> ou <strong>Copia e Cola</strong>.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p className="text-stone-700 text-[11px] leading-snug">
                Confira o valor exato de <strong>{formatCurrency(amount)}</strong> e o destinatário <strong>{pixName}</strong>.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p className="text-stone-700 text-[11px] leading-snug">
                Confirme o pagamento e <strong>envie o comprovante pelo WhatsApp</strong> para liberarmos a entrega!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Receipt Quick Action button */}
      {onOpenWhatsAppReceipt && (
        <div className="pt-2 flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-emerald-200">
          <div className="text-xs text-stone-700 font-medium">
            📸 <strong>Já pagou o Pix?</strong> Envie a foto do comprovante para o nosso WhatsApp!
          </div>
          <button
            type="button"
            onClick={onOpenWhatsAppReceipt}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Enviar Comprovante</span>
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
