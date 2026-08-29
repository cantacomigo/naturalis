import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Package, 
  Layers, 
  History, 
  Settings, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Check, 
  Copy, 
  Phone, 
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { StoreSettings } from '../types';

interface FruitPulpOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

interface PulpItemOption {
  id: string;
  name: string;
  category: 'frutas_tropicais' | 'frutas_vermelhas' | 'citricos' | 'especiais';
  icon: string;
  defaultPackageKg: number;
  availableSizes: { label: string; kg: number }[];
}

const DEFAULT_PULP_OPTIONS: PulpItemOption[] = [
  {
    id: 'pulp-maracuja',
    name: 'Polpa de Maracujá Puro (100% Natural)',
    category: 'frutas_tropicais',
    icon: '🥭',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }, { label: '100g', kg: 0.1 }, { label: 'Barra 5kg', kg: 5 }]
  },
  {
    id: 'pulp-morango',
    name: 'Polpa de Morango Selecionado',
    category: 'frutas_vermelhas',
    icon: '🍓',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }, { label: 'Barra 5kg', kg: 5 }]
  },
  {
    id: 'pulp-manga',
    name: 'Polpa de Manga Palmer / Tommy',
    category: 'frutas_tropicais',
    icon: '🥭',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }, { label: 'Barra 5kg', kg: 5 }]
  },
  {
    id: 'pulp-graviola',
    name: 'Polpa de Graviola Silvestre',
    category: 'frutas_tropicais',
    icon: '🍈',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-acai',
    name: 'Polpa de Açaí Médio / Especial Puro',
    category: 'especiais',
    icon: '🍇',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: 'Barra 5kg', kg: 5 }, { label: 'Balde 10kg', kg: 10 }]
  },
  {
    id: 'pulp-abacaxi-hortela',
    name: 'Polpa de Abacaxi com Hortelã',
    category: 'citricos',
    icon: '🍍',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-limao-taiti',
    name: 'Suco / Polpa de Limão Taiti Concentrado',
    category: 'citricos',
    icon: '🍋',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-frutas-vermelhas',
    name: 'Mix de Frutas Vermelhas (Amora, Mirtilo, Framboesa)',
    category: 'frutas_vermelhas',
    icon: '🍒',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-coco',
    name: 'Polpa de Coco Verde / Flocos Cremoso',
    category: 'especiais',
    icon: '🥥',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-cupuacu',
    name: 'Polpa de Cupuaçu Puro do Norte',
    category: 'especiais',
    icon: '🌰',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-goiaba',
    name: 'Polpa de Goiaba Vermelha',
    category: 'frutas_tropicais',
    icon: '🍐',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-uva',
    name: 'Polpa de Uva Roxa Integral',
    category: 'frutas_vermelhas',
    icon: '🍇',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-acerola',
    name: 'Polpa de Acerola Rica em Vitamina C',
    category: 'citricos',
    icon: '🍒',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  },
  {
    id: 'pulp-caju',
    name: 'Polpa de Caju Natural',
    category: 'frutas_tropicais',
    icon: '🍎',
    defaultPackageKg: 1,
    availableSizes: [{ label: '1 kg', kg: 1 }, { label: '500g', kg: 0.5 }]
  }
];

interface SelectedPulpOrder {
  id: string;
  name: string;
  packageSizeLabel: string;
  packageKg: number;
  quantity: number;
  notes?: string;
}

interface SavedPulpOrderRecord {
  id: string;
  createdAt: string;
  items: SelectedPulpOrder[];
  totalKg: number;
  totalPacks: number;
  supplierName?: string;
  notes?: string;
}

export const FruitPulpOrdersModal: React.FC<FruitPulpOrdersModalProps> = ({
  isOpen,
  onClose,
  storeSettings,
  onSaveSettings,
}) => {
  const defaultAppUrl = storeSettings.fruitPulpAppUrl || 'https://aistudio.google.com/apps/ed1b11a4-eeb9-45b2-a82b-149eb44c4413?showAssistant=true&showPreview=true';

  const [activeTab, setActiveTab] = useState<'app' | 'fast_order' | 'history' | 'settings'>('app');
  const [appUrl, setAppUrl] = useState(defaultAppUrl);
  const [supplierName, setSupplierName] = useState(storeSettings.fruitPulpSupplierName || 'Distribuidora de Polpas Naturais');
  const [supplierPhone, setSupplierPhone] = useState(storeSettings.fruitPulpSupplierPhone || '');
  
  // Fast order builder states
  const [orderItems, setOrderItems] = useState<SelectedPulpOrder[]>([
    {
      id: 'pulp-maracuja',
      name: 'Polpa de Maracujá Puro (100% Natural)',
      packageSizeLabel: '1 kg',
      packageKg: 1,
      quantity: 5,
    },
    {
      id: 'pulp-morango',
      name: 'Polpa de Morango Selecionado',
      packageSizeLabel: '1 kg',
      packageKg: 1,
      quantity: 3,
    },
    {
      id: 'pulp-manga',
      name: 'Polpa de Manga Palmer / Tommy',
      packageSizeLabel: '1 kg',
      packageKg: 1,
      quantity: 3,
    }
  ]);

  const [orderUrgency, setOrderUrgency] = useState<'normal' | 'urgente' | 'programado'>('normal');
  const [orderNotes, setOrderNotes] = useState('');
  const [customPulpName, setCustomPulpName] = useState('');
  const [customPulpSize, setCustomPulpSize] = useState('1 kg');
  const [customPulpKg, setCustomPulpKg] = useState(1);
  const [customPulpQty, setCustomPulpQty] = useState(1);

  // Iframe states
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [isIframeFullscreen, setIsIframeFullscreen] = useState(false);

  // Copy notification
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Order history
  const [historyOrders, setHistoryOrders] = useState<SavedPulpOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('naturalis_pulp_orders_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    setAppUrl(storeSettings.fruitPulpAppUrl || defaultAppUrl);
    setSupplierName(storeSettings.fruitPulpSupplierName || 'Distribuidora de Polpas Naturais');
    setSupplierPhone(storeSettings.fruitPulpSupplierPhone || '');
  }, [storeSettings]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quantity helpers
  const handleUpdateItemQuantity = (id: string, packageSizeLabel: string, delta: number) => {
    setOrderItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id && item.packageSizeLabel === packageSizeLabel) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: Math.max(0, nextQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleAddItemFromCatalog = (pulp: PulpItemOption, sizeLabel: string, sizeKg: number) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === pulp.id && item.packageSizeLabel === sizeLabel);
      if (existing) {
        return prev.map((item) =>
          item.id === pulp.id && item.packageSizeLabel === sizeLabel
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: pulp.id,
          name: pulp.name,
          packageSizeLabel: sizeLabel,
          packageKg: sizeKg,
          quantity: 1,
        }
      ];
    });
    showToast(`Adicionado: ${pulp.name} (${sizeLabel})`);
  };

  const handleAddCustomPulp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPulpName.trim()) return;

    const newItem: SelectedPulpOrder = {
      id: `custom-${Date.now()}`,
      name: customPulpName.trim(),
      packageSizeLabel: customPulpSize.trim() || '1 kg',
      packageKg: customPulpKg || 1,
      quantity: Math.max(1, customPulpQty),
    };

    setOrderItems((prev) => [...prev, newItem]);
    setCustomPulpName('');
    setCustomPulpQty(1);
    showToast(`Adicionado item customizado: ${newItem.name}`);
  };

  const handleRemoveItem = (id: string, packageSizeLabel: string) => {
    setOrderItems((prev) => prev.filter((i) => !(i.id === id && i.packageSizeLabel === packageSizeLabel)));
  };

  const handleClearOrder = () => {
    if (window.confirm('Deseja limpar todos os itens da lista de reposição?')) {
      setOrderItems([]);
    }
  };

  // Calculations
  const totalPackages = orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalKg = orderItems.reduce((acc, item) => acc + (item.quantity * item.packageKg), 0);

  // Message builder
  const generateWhatsAppMessage = () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let urgencyLabel = 'Normal (conforme rota)';
    if (orderUrgency === 'urgente') urgencyLabel = '⚠️ URGENTE (Estoque crítico)';
    if (orderUrgency === 'programado') urgencyLabel = '🗓️ Programado para a próxima remessa';

    let msg = `🍧 *PEDIDO DE REPOSIÇÃO DE POLPAS & INSUMOS* 🍧\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 *Loja:* ${storeSettings.storeName || 'Naturalis Gourmet'}\n`;
    msg += `📍 *Cidade:* ${storeSettings.city || 'Olímpia - SP'}\n`;
    msg += `📅 *Data:* ${dateFormatted} às ${timeFormatted}\n`;
    msg += `⚡ *Prioridade:* ${urgencyLabel}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `📦 *ITENS SOLICITADOS:*\n`;
    orderItems.forEach((item, index) => {
      const itemKg = (item.quantity * item.packageKg).toFixed(1).replace('.0', '');
      msg += `  ${index + 1}. *${item.quantity}x* ${item.name} (${item.packageSizeLabel}) → *${itemKg} kg*\n`;
    });

    msg += `\n📊 *RESUMO DO PEDIDO:*\n`;
    msg += `• Total de Pacotes: *${totalPackages} un.*\n`;
    msg += `• Peso Total Estimado: *${totalKg.toFixed(1).replace('.0', '')} kg*\n`;

    if (orderNotes.trim()) {
      msg += `\n📝 *Observações / Instruções:*\n${orderNotes.trim()}\n`;
    }

    msg += `\nFavor confirmar recebimento, disponibilidade e previsão de entrega. Muito obrigado! 🙏`;
    return msg;
  };

  const handleSendToWhatsApp = () => {
    if (orderItems.length === 0) {
      alert('Adicione pelo menos uma polpa ou insumo antes de enviar o pedido.');
      return;
    }

    const message = generateWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    
    // Clean supplier phone
    const cleanPhone = (supplierPhone || '').replace(/\D/g, '');
    let url = '';
    if (cleanPhone.length >= 10) {
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      url = `https://wa.me/${fullPhone}?text=${encoded}`;
    } else {
      url = `https://wa.me/?text=${encoded}`;
    }

    // Save to history
    const newRecord: SavedPulpOrderRecord = {
      id: `pulp-order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: [...orderItems],
      totalKg,
      totalPacks: totalPackages,
      supplierName: supplierName || 'Fornecedor de Polpas',
      notes: orderNotes.trim() || undefined,
    };

    const updatedHistory = [newRecord, ...historyOrders].slice(0, 30);
    setHistoryOrders(updatedHistory);
    try {
      localStorage.setItem('naturalis_pulp_orders_history', JSON.stringify(updatedHistory));
    } catch {}

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    showToast('Texto do pedido copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRestorePastOrder = (order: SavedPulpOrderRecord) => {
    setOrderItems(order.items);
    if (order.notes) setOrderNotes(order.notes);
    setActiveTab('fast_order');
    showToast(`Pedido anterior restaurado com ${order.items.length} itens!`);
  };

  const handleDeleteHistoryOrder = (id: string) => {
    const filtered = historyOrders.filter((o) => o.id !== id);
    setHistoryOrders(filtered);
    try {
      localStorage.setItem('naturalis_pulp_orders_history', JSON.stringify(filtered));
    } catch {}
    showToast('Registro de pedido removido do histórico.');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: StoreSettings = {
      ...storeSettings,
      fruitPulpAppUrl: appUrl.trim() || defaultAppUrl,
      fruitPulpSupplierName: supplierName.trim(),
      fruitPulpSupplierPhone: supplierPhone.trim(),
    };
    onSaveSettings(updatedSettings);
    showToast('Configurações do módulo de polpas salvas com sucesso!');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      id="fruit-pulp-orders-modal"
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isIframeFullscreen ? 'fixed inset-2 z-50 max-w-none max-h-none h-[calc(100vh-1rem)]' : 'max-w-4xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white flex items-center justify-between gap-3 shrink-0 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shadow-xs">
              🥭
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-stone-50">
                  Pedidos de Polpas de Frutas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Suprimentos & Reposição
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Acesse o app de polpas integrado ou envie pedidos rápidos de reposição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
              id="fruit-pulp-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 bg-stone-50 border-b border-stone-200 shrink-0 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('app')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm border-t border-x transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'app'
                ? 'bg-white text-emerald-800 border-stone-200 border-b-white -mb-px shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-emerald-600" />
            <span>Sistema de Polpas (App)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fast_order')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm border-t border-x transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fast_order'
                ? 'bg-white text-emerald-800 border-stone-200 border-b-white -mb-px shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Pedido Rápido (WhatsApp)</span>
            {orderItems.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {orderItems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm border-t border-x transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-emerald-800 border-stone-200 border-b-white -mb-px shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent'
            }`}
          >
            <History className="w-4 h-4 text-stone-500" />
            <span>Histórico ({historyOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm border-t border-x transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-emerald-800 border-stone-200 border-b-white -mb-px shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Configurações</span>
          </button>
        </div>

        {/* Tab 1: Applet Access & Embedded Webview */}
        {activeTab === 'app' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 bg-stone-100/60">
            {/* Top Launch Card */}
            <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-800/40 mb-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥭</span>
                  <h4 className="font-extrabold text-sm sm:text-base text-stone-50">
                    Sistema de Pedidos de Polpas & Insumos
                  </h4>
                </div>
                <p className="text-xs text-stone-300 max-w-xl line-clamp-2">
                  Link configurado: <code className="bg-stone-950/60 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px] select-all break-all">{appUrl}</code>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  id="fruit-pulp-open-external-btn"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir em Nova Aba (Tela Cheia)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIframeKey((k) => k + 1);
                    setIsIframeLoaded(false);
                    setIframeError(false);
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Recarregar Visualizador"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsIframeFullscreen((f) => !f)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-xl transition-colors cursor-pointer hidden sm:flex"
                  title={isIframeFullscreen ? 'Restaurar Tamanho' : 'Expandir'}
                >
                  {isIframeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Embedded Frame View */}
            <div className="flex-1 bg-white rounded-2xl border border-stone-300/80 shadow-inner overflow-hidden relative flex flex-col">
              {!isIframeLoaded && !iframeError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-50 text-stone-600 gap-3 p-4 text-center">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold">Carregando Sistema de Polpas...</p>
                  <p className="text-[11px] text-stone-400 max-w-sm">
                    Se a página do assistente não carregar dentro do quadro por restrições de segurança do navegador, utilize o botão verde acima para abrir em nova aba.
                  </p>
                </div>
              )}

              {iframeError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-amber-50/50 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h4 className="font-bold text-sm text-stone-900">Visualização Externa Recomendada</h4>
                    <p className="text-xs text-stone-600">
                      O Google AI Studio e plataformas com autenticação funcionam com total comodidade quando abertos diretamente em uma nova aba do navegador.
                    </p>
                  </div>
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Clique aqui para abrir em Nova Aba</span>
                  </a>
                </div>
              ) : (
                <iframe
                  key={iframeKey}
                  src={appUrl}
                  title="Sistema de Polpas de Frutas"
                  className="w-full h-full border-0 flex-1"
                  onLoad={() => setIsIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                  allow="camera; microphone; geolocation"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Fast Order Builder via WhatsApp */}
        {activeTab === 'fast_order' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Banner */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">📦</span>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                    Montar Pedido de Reposição de Polpas
                  </h4>
                </div>
                <p className="text-[11px] text-emerald-800/80">
                  Selecione as polpas abaixo ou digite itens personalizados. O pedido será formatado automaticamente para envio no WhatsApp do fornecedor.
                </p>
              </div>

              {orderItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearOrder}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold border border-rose-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Lista</span>
                </button>
              )}
            </div>

            {/* Current Order Summary Box */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                    Itens no Pedido Atual ({orderItems.length})
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-stone-600">
                    Pacotes: <strong className="text-stone-900">{totalPackages} un.</strong>
                  </span>
                  <span className="font-semibold text-stone-600">
                    Total: <strong className="text-emerald-700">{totalKg.toFixed(1).replace('.0', '')} kg</strong>
                  </span>
                </div>
              </div>

              {orderItems.length === 0 ? (
                <div className="py-8 text-center text-stone-400 space-y-2">
                  <Package className="w-8 h-8 mx-auto stroke-1 text-stone-300" />
                  <p className="text-xs">Nenhuma polpa adicionada ao pedido no momento.</p>
                  <p className="text-[11px] text-stone-400">
                    Clique nas polpas do catálogo abaixo para adicionar à lista.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-200/80 max-h-60 overflow-y-auto pr-1">
                  {orderItems.map((item) => {
                    const itemKg = (item.quantity * item.packageKg).toFixed(1).replace('.0', '');
                    return (
                      <div key={`${item.id}-${item.packageSizeLabel}`} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-stone-900 truncate">
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <span className="bg-stone-200/80 px-1.5 py-0.2 rounded font-medium text-stone-700">
                              Embalagem: {item.packageSizeLabel}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">
                              Subtotal: {itemKg} kg
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Stepper */}
                          <div className="flex items-center bg-white rounded-xl border border-stone-300 shadow-2xs p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.id, item.packageSizeLabel, -1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center font-black text-xs text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.id, item.packageSizeLabel, 1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id, item.packageSizeLabel)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Urgency and Notes */}
              <div className="pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Prioridade do Pedido
                  </label>
                  <select
                    value={orderUrgency}
                    onChange={(e) => setOrderUrgency(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="normal">Normal (Fluxo padrão)</option>
                    <option value="urgente">⚠️ Urgente (Estoque Baixo/Crítico)</option>
                    <option value="programado">🗓️ Programado (Próxima Remessa)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Observações / Instruções para o Fornecedor
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ex: Entregar pela manhã, emitir nota..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Fornecedor: <strong>{supplierName}</strong> {supplierPhone ? `(${supplierPhone})` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    disabled={orderItems.length === 0}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white hover:bg-stone-100 text-stone-800 font-bold border border-stone-300 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Mensagem'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    disabled={orderItems.length === 0}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                    id="fruit-pulp-send-whatsapp-btn"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Pedido pelo WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Catalog of Fruit Pulps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    Catálogo de Polpas Frequentes
                  </h4>
                </div>
                <span className="text-[11px] text-stone-500">
                  Clique em um tamanho para adicionar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DEFAULT_PULP_OPTIONS.map((pulp) => {
                  return (
                    <div 
                      key={pulp.id}
                      className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl shrink-0 p-1 bg-stone-100 rounded-xl">{pulp.icon}</span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-stone-900 leading-tight">
                            {pulp.name}
                          </h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-stone-100">
                        {pulp.availableSizes.map((size) => (
                          <button
                            key={size.label}
                            type="button"
                            onClick={() => handleAddItemFromCatalog(pulp, size.label, size.kg)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors active:scale-95 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-emerald-700" />
                            <span>{size.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Item Form */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                  Adicionar Outro Insumo / Polpa Personalizada
                </h4>
              </div>

              <form onSubmit={handleAddCustomPulp} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={customPulpName}
                    onChange={(e) => setCustomPulpName(e.target.value)}
                    placeholder="Nome do insumo (Ex: Polpa de Pitaya, Emulsificante, Liga Neutra)"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={customPulpSize}
                    onChange={(e) => setCustomPulpSize(e.target.value)}
                    placeholder="Tamanho (Ex: 1 kg, Balde 5kg)"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Order History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900">
                  Histórico de Pedidos de Reposição
                </h4>
                <p className="text-xs text-stone-500">
                  Consulte pedidos enviados e reutilize com 1 clique.
                </p>
              </div>
            </div>

            {historyOrders.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
                <History className="w-10 h-10 mx-auto stroke-1 text-stone-300" />
                <p className="text-xs font-semibold">Nenhum pedido registrado no histórico ainda.</p>
                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  Assim que você enviar um pedido pelo WhatsApp na aba anterior, ele ficará salvo aqui para futuras reposições.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleString('pt-BR');
                  return (
                    <div 
                      key={order.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-stone-900 flex items-center gap-2">
                            <span>📦 Pedido de {order.totalKg.toFixed(1).replace('.0', '')} kg ({order.totalPacks} pacotes)</span>
                          </span>
                          <p className="text-[11px] text-stone-500">
                            Enviado em: {dateStr} • {order.supplierName || 'Fornecedor de Polpas'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestorePastOrder(order)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Carregar este pedido novamente na aba Pedido Rápido"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Repetir Pedido</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryOrder(order.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Excluir do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-stone-700">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="font-bold">{item.quantity}x</span>
                            <span className="truncate">{item.name} ({item.packageSizeLabel})</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                          📝 {order.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>Link do Aplicativo / Projeto de Polpas (AI Studio)</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    URL do Projeto de Polpas
                  </label>
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://aistudio.google.com/apps/..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Padrão: <code className="text-emerald-700">{defaultAppUrl}</code>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Dados do Fornecedor de Polpas (WhatsApp)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Nome do Fornecedor / Empresa
                    </label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="Ex: Distribuidora de Polpas Naturais"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      WhatsApp do Fornecedor (com DDD)
                    </label>
                    <input
                      type="text"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      placeholder="Ex: 11999998888 ou 17988887777"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Salvar Configurações de Polpas
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer / Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-stone-900 text-stone-100 text-xs font-bold text-center border-t border-stone-800 animate-in slide-in-from-bottom-2 duration-150">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
