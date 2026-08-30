import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Smartphone, 
  Share2, 
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency, formatPhoneDisplay } from '../utils/whatsapp';
import { generatePixPayload, generatePixQrCodeDataUrl } from '../utils/pixPayload';
import { NaturalisLogo } from './NaturalisLogo';

interface PixQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId?: string;
  customerName?: string;
  storeSettings: StoreSettings;
  onSendReceiptWhatsApp?: () => void;
}

export const PixQrCodeModal: React.FC<PixQrCodeModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  customerName,
  storeSettings,
  onSendReceiptWhatsApp,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const pixKey = storeSettings?.pixKey || '11999998888';
  const pixKeyType = storeSettings?.pixKeyType || 'Celular';
  const pixName = storeSettings?.pixName || storeSettings?.storeName || 'Naturalis Gourmet';
  const pixCity = storeSettings?.city || 'Olímpia';
  const txId = orderId ? `NAT${orderId}` : 'NATURALIS';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

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

      generatePixQrCodeDataUrl(payload, 420).then((url) => {
        if (isMounted) {
          setQrCodeDataUrl(url);
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Error generating Pix modal QR:', err);
      if (isMounted) setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, pixKey, pixKeyType, pixName, pixCity, amount, txId, orderId]);

  if (!isOpen) return null;

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PIX Naturalis Gourmet - Pedido #${orderId || '0000'}`,
          text: `Chave PIX: ${pixKey} (${pixName}) - Valor: ${formatCurrency(amount)}\n\nCódigo Pix Copia e Cola:\n${pixPayload}`,
        });
      } catch {}
    } else {
      handleCopyPayload();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-xs">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  QR Code PIX
                </h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-white/80 font-normal">
                {customerName ? `Cliente: ${customerName}` : 'Pague instantaneamente via Pix'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4 text-stone-900">
          {/* Amount Showcase Banner */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Valor Total do Pedido {orderId ? `#${orderId}` : ''}
            </span>
            <span className="text-3xl font-black text-emerald-700 block">
              {formatCurrency(amount)}
            </span>
            <div className="flex items-center justify-center gap-2 text-xs text-stone-600">
              <span>Beneficiário: <strong>{pixName}</strong></span>
              <span>•</span>
              <span>{pixCity}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="p-3 bg-white rounded-2xl border-2 border-emerald-300 shadow-md">
              {isLoading ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-stone-500 font-bold">Gerando QR Code...</span>
                </div>
              ) : qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code Pix" 
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
                  QR Code indisponível
                </div>
              )}
            </div>

            <p className="text-xs text-stone-500 font-medium mt-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Abra o app do seu banco e aponte a câmera
            </p>
          </div>

          {/* Copia e Cola Input and Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span>PIX COPIA E COLA (BACEN):</span>
              <span className="text-[11px] text-emerald-700 font-semibold">1-Clique para copiar</span>
            </div>
            <div className="relative">
              <input 
                type="text"
                readOnly
                value={pixPayload || 'Gerando código...'}
                onClick={handleCopyPayload}
                className="w-full bg-stone-50 border border-emerald-300 rounded-xl pl-3 pr-24 py-3 text-xs font-mono text-stone-800 select-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={handleCopyPayload}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                  copiedCode 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            {copiedCode && (
              <p className="text-[11px] font-bold text-emerald-800 animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Código Pix copiado! Cole no app do seu banco.
              </p>
            )}
          </div>

          {/* Chave Pix Simples */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Chave {pixKeyType}:</span>
              <span className="font-mono font-bold text-stone-900 select-all">{pixKey}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyKey}
              className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
              <span>{copiedKey ? 'Copiado' : 'Copiar Chave'}</span>
            </button>
          </div>

          {/* Action Buttons: Download & Share */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrCodeDataUrl}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>Baixar Imagem</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
            >
              <Share2 className="w-4 h-4 text-stone-600" />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2">
          {onSendReceiptWhatsApp ? (
            <button
              type="button"
              onClick={onSendReceiptWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Já paguei! Enviar Comprovante no WhatsApp</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
