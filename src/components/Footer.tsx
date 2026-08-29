import React from 'react';
import { MapPin, Clock, Shield, MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';
import { NaturalisLogo } from './NaturalisLogo';

interface FooterProps {
  storeSettings: StoreSettings;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuth?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  isAdminAuthenticated = false,
  onOpenAdminAuth,
  onOpenAdminPanel,
}) => {
  // Format WhatsApp number for display and link
  const rawNumber = storeSettings?.whatsappNumber || '5517981062768';
  const whatsappDigits = rawNumber.replace(/\D/g, '') || '5517981062768';
  
  // Format display phone
  const displayPhone = whatsappDigits === '5517981062768' 
    ? '+5517981062768'
    : `+${whatsappDigits}`;

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#181513] text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10 text-xs">
          
          {/* Column 1: Logo & Brand Description */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <NaturalisLogo className="w-12 h-12 shrink-0 drop-shadow-md" priority />
              <div>
                <span className="font-bold text-lg sm:text-xl text-white tracking-tight font-serif block">
                  Naturalis Gourmet
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-500 uppercase tracking-wider block -mt-0.5">
                  GELADINHOS ARTESANAIS
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed font-normal">
              O verdadeiro sabor da infância com ingredientes nobres, cremosidade aveludada e receitas autorais feitas com carinho diariamente.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Atendimento Online no WhatsApp</span>
            </div>
          </div>

          {/* Column 2: Navegação Rápida */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3.5">
              NAVEGAÇÃO RÁPIDA
            </h4>
            <ul className="space-y-2.5 text-stone-400 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('secao-catalogo')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cardápio de Sabores
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('secao-combos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Kits Promocionais com Desconto
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('secao-avaliacoes')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Avaliações dos Clientes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('secao-faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Dúvidas Frequentes & Conservação
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Atendimento & Horários */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3.5">
              ATENDIMENTO & HORÁRIOS
            </h4>
            <div className="space-y-3 text-stone-400 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Segunda a Sabado 08:00 às 22:00 / Domingo: 14:00 às 22:00
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Rua Bernardino de Campos, 120 - Patrimônio São João Batista (Retirada no portão)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors leading-snug font-medium"
                >
                  WhatsApp: {displayPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Dúvidas ou Encomendas? */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3.5">
              DÚVIDAS OU ENCOMENDAS?
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed mb-4 font-normal">
              Atendemos encomendas especiais para festas de aniversário, confraternizações e eventos empresariais.
            </p>
            <a
              href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre os geladinhos / encomendas.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a86b] hover:bg-[#00925d] text-white font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 font-normal">
          <p className="flex items-center gap-1">
            © 2026 Naturalis Gourmet. Feito com <span className="text-rose-500">❤️</span> para amantes de sobremesas.
          </p>

          <button
            type="button"
            onClick={isAdminAuthenticated ? onOpenAdminPanel : onOpenAdminAuth}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors cursor-pointer"
            title="Acesso ao painel administrativo"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Painel Admin (Cardápio, Fretes & Pedidos)</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
