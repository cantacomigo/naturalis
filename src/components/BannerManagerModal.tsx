import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Check, 
  Sparkles, 
  Search, 
  Clock, 
  Layers, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw,
  Sliders,
  Play,
  CheckCircle2,
  ExternalLink,
  Flame,
  ShoppingBag
} from 'lucide-react';
import { GeladinhoProduct, StoreSettings, PanoramicBannerSlide } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/products';
import { formatCurrency } from '../utils/whatsapp';

export interface BannerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  products: GeladinhoProduct[];
  onSaveSettings: (updated: StoreSettings) => void;
}

export const BannerManagerModal: React.FC<BannerManagerModalProps> = ({
  isOpen,
  onClose,
  settings,
  products,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'products' | 'current' | 'upload' | 'settings'>('products');
  const [productSearch, setProductSearch] = useState('');
  
  // Banner slides local copy
  const [banners, setBanners] = useState<PanoramicBannerSlide[]>(() => {
    if (settings.panoramicBanners && settings.panoramicBanners.length > 0) {
      return [...settings.panoramicBanners];
    }
    return DEFAULT_STORE_SETTINGS.panoramicBanners || [
      {
        id: 'banner-brand',
        imageUrl: '/images/banner.jpg',
        title: 'Naturalis Gourmet',
        subtitle: 'Sabores Reais • Geladinhos Artesanais',
        badge: 'Marca Oficial',
        linkAction: 'catalog',
        active: true
      }
    ];
  });

  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(settings.panoramicAutoplayEnabled !== false);
  const [autoplayInterval, setAutoplayInterval] = useState<number>(settings.panoramicAutoplayIntervalSec || 5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Custom Upload state
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customBadge, setCustomBadge] = useState('');
  const [customLinkAction, setCustomLinkAction] = useState<'catalog' | 'combos' | 'product'>('catalog');
  const [customSelectedProductId, setCustomSelectedProductId] = useState<string>(products[0]?.id || '');
  const [uploadError, setUploadError] = useState('');

  // Filter products for the picker
  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tagline && p.tagline.toLowerCase().includes(q))
    );
  });

  // Save all changes
  const handleSave = () => {
    const updatedSettings: StoreSettings = {
      ...settings,
      panoramicBanners: banners,
      panoramicAutoplayEnabled: autoplayEnabled,
      panoramicAutoplayIntervalSec: autoplayInterval,
    };
    onSaveSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Add a product photo to banners
  const handleAddProductToBanner = (prod: GeladinhoProduct) => {
    const newSlide: PanoramicBannerSlide = {
      id: `banner-prod-${prod.id}-${Date.now()}`,
      imageUrl: prod.image,
      title: prod.name,
      subtitle: prod.tagline || prod.description || 'Geladinho Gourmet Artesanal Naturalis',
      badge: prod.badges?.[0] || 'Sabor Especial',
      linkAction: 'product',
      productId: prod.id,
      active: true,
    };

    setBanners((prev) => [...prev, newSlide]);
  };

  // Add custom slide
  const handleAddCustomSlide = () => {
    if (!customImageUrl) {
      setUploadError('Por favor insira a URL ou faça upload de uma imagem.');
      return;
    }

    const newSlide: PanoramicBannerSlide = {
      id: `banner-custom-${Date.now()}`,
      imageUrl: customImageUrl,
      title: customTitle || 'Novidade Gourmet',
      subtitle: customSubtitle || 'Experimente nossos geladinhos artesanais',
      badge: customBadge || 'Destaque',
      linkAction: customLinkAction,
      productId: customLinkAction === 'product' ? customSelectedProductId : undefined,
      active: true,
    };

    setBanners((prev) => [...prev, newSlide]);
    setCustomImageUrl('');
    setCustomTitle('');
    setCustomSubtitle('');
    setCustomBadge('');
    setUploadError('');
    setActiveTab('current');
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomImageUrl(event.target.result);
        setUploadError('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Move slide up/down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === banners.length - 1)
    ) {
      return;
    }

    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;
    setBanners(newBanners);
  };

  // Toggle active slide
  const handleToggleSlideActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: b.active === false ? true : false } : b))
    );
  };

  // Remove slide
  const handleRemoveSlide = (id: string) => {
    if (banners.length <= 1) {
      alert('É necessário manter pelo menos 1 foto/banner cadastrado no carrossel.');
      return;
    }
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // Reset to default banners
  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar as fotos e banners padrão do carrossel do topo?')) {
      setBanners(DEFAULT_STORE_SETTINGS.panoramicBanners || []);
      setAutoplayEnabled(true);
      setAutoplayInterval(5);
    }
  };

  const isProductInBanners = (productId: string) => {
    return banners.some((b) => b.productId === productId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Gerenciador de Fotos & Banners do Topo
                </h3>
                <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  {banners.filter(b => b.active !== false).length} Ativos
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Escolha fotos dos seus produtos cadastrados ou envie novas fotos para o carrossel automático do topo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 gap-2 overflow-x-auto shrink-0 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1. Escolher dos Produtos ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'current'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>2. Fotos no Carrossel ({banners.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>3. Enviar Foto / URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>4. Tempo & Transição</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-stone-50/50">
          
          {/* TAB 1: ESCOLHER FOTOS DOS PRODUTOS CADASTRADOS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-stone-900">
                    Selecione as fotos dos sabores para passar no banner do topo
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Ao adicionar, o cliente poderá clicar na foto do banner para abrir diretamente o sabor correspondente.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar por nome ou categoria..."
                    className="w-full pl-8.5 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredProducts.map((prod) => {
                  const alreadyAdded = isProductInBanners(prod.id);

                  return (
                    <div
                      key={prod.id}
                      className={`bg-white rounded-2xl p-3 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                        alreadyAdded ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-300' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 truncate">
                              {prod.category}
                            </span>
                            {alreadyAdded && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                No Banner
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-stone-900 truncate">
                            {prod.name}
                          </h5>
                          <p className="text-[11px] text-stone-500 font-medium">
                            {formatCurrency(prod.price)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddProductToBanner(prod)}
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            alreadyAdded
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                              : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{alreadyAdded ? 'Adicionar Outra Vez' : '+ Adicionar Foto ao Banner'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FOTOS ATUAIS NO CARROSSEL (ORGANIZAÇÃO E ORDEM) */}
          {activeTab === 'current' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Fotos e Banners em Exibição no Topo ({banners.length})
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Reordene, ative/desative ou remova as fotos que passam na rotação automática.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Restaurar banners padrões"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões</span>
                </button>
              </div>

              {banners.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                  <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-700">Nenhuma foto adicionada ao carrossel</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Vá na aba "Escolher dos Produtos" para adicionar fotos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {banners.map((slide, idx) => {
                    const isActive = slide.active !== false;

                    return (
                      <div
                        key={slide.id}
                        className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs ${
                          isActive ? 'border-stone-200' : 'border-dashed border-stone-300 opacity-60 bg-stone-50'
                        }`}
                      >
                        {/* Slide Preview & Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-stone-100 font-mono text-xs font-bold text-stone-600 flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>

                          <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-900">
                            <img
                              src={slide.imageUrl}
                              alt={slide.title || 'Banner'}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {slide.badge && (
                              <span className="absolute top-1 left-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white">
                                {slide.badge}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-extrabold text-stone-900 truncate">
                                {slide.title || 'Banner Sem Título'}
                              </h5>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-200 text-stone-600 border-stone-300'
                              }`}>
                                {isActive ? 'Ativo' : 'Oculto'}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-500 truncate mt-0.5 font-normal">
                              {slide.subtitle || 'Sem descrição secundária'}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-600 font-semibold">
                              <span className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3 text-amber-500" />
                                {slide.linkAction === 'product' && 'Abre sabor do cardápio'}
                                {slide.linkAction === 'combos' && 'Rola para Combos'}
                                {slide.linkAction === 'catalog' && 'Rola para Cardápio'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls (Reorder, Toggle, Remove) */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleMoveSlide(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveSlide(idx, 'down')}
                            disabled={idx === banners.length - 1}
                            className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSlideActive(slide.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-amber-100 text-amber-800'
                            }`}
                            title={isActive ? 'Ocultar slide' : 'Ativar slide'}
                          >
                            {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(slide.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Remover do banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENVIAR FOTO PERSONALIZADA OU URL */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  Adicionar Foto Personalizada ou Banner Promocional
                </h4>
                <p className="text-[11px] text-stone-500">
                  Você pode fazer upload de uma foto da sua cozinha ou colar o link de uma imagem externa.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {uploadError}
                </div>
              )}

              {/* Upload Input & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Upload de Imagem (do seu computador / celular)
                  </label>
                  <label className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-stone-50/60 hover:bg-amber-50/30">
                    <Upload className="w-6 h-6 text-stone-400 mb-1" />
                    <span className="text-xs font-bold text-stone-700">Clique para selecionar imagem</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG ou WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ou Cole a URL da Imagem Direta
                  </label>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setUploadError('');
                    }}
                    placeholder="https://exemplo.com/foto-banner.jpg"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
                  />

                  {customImageUrl && (
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-stone-200 bg-stone-900">
                      <img
                        src={customImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Título Principal do Banner
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Novo Sabor da Estação"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Subtítulo / Descrição Curta
                  </label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    placeholder="Ex: Feito com ingredientes frescos"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Selo / Badge (opcional)
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder="Ex: Lançamento, Artesanal..."
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Link Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Ao Clicar no Banner:
                  </label>
                  <select
                    value={customLinkAction}
                    onChange={(e) => setCustomLinkAction(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="catalog">Rolar para o Cardápio de Sabores</option>
                    <option value="combos">Rolar para os Kits & Combos</option>
                    <option value="product">Abrir Detalhes de um Sabor Específico</option>
                  </select>
                </div>

                {customLinkAction === 'product' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Selecione o Sabor Cadastrado:
                    </label>
                    <select
                      value={customSelectedProductId}
                      onChange={(e) => setCustomSelectedProductId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCurrency(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddCustomSlide}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Foto ao Carrossel</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPO E CONFIGURAÇÃO DA TRANSIÇÃO AUTOMÁTICA */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-5">
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  Transição Automática das Fotos (Carrossel Rotativo)
                </h4>
                <p className="text-[11px] text-stone-500">
                  Configure o tempo que cada foto permanece na tela antes de passar para a próxima.
                </p>
              </div>

              {/* Autoplay Toggle */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      Rotação Automática das Fotos
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${
                      autoplayEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-200 text-stone-600 border-stone-300'
                    }`}>
                      {autoplayEnabled ? 'Ativada' : 'Pausada'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    As fotos passam sozinhas com transição suave para os clientes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoplayEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={autoplayEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      autoplayEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Interval Speed Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  Tempo de Exibição de Cada Foto:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[3, 4, 5, 6, 8, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setAutoplayInterval(sec)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        autoplayInterval === sec
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-sm font-black">{sec}s</span>
                      <span className="text-[9px] opacity-75">{sec === 5 ? 'Recomendado' : 'segundos'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Total de fotos configuradas: <strong>{banners.length}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-700 font-bold rounded-xl text-xs border border-stone-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Fotos do Carrossel</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
