import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import imperioLogo from "../assets/imperiologo.jpg";

const whatsappNumber = "5561999990000";
const message = "Olá! Vim pelo site da Império Imóveis e gostaria de falar com um atendimento.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

export function WhatsAppContact() {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
      {open && (
        <div className="w-80 max-w-full rounded-lg border border-[#D3AA53]/30 bg-[#17191c] p-4 text-[#ECECEC] shadow-2xl shadow-black/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={imperioLogo} alt="Império Imóveis" className="h-11 w-11 rounded-full border border-[#D3AA53]/60 object-cover" />
              <div>
                <p className="font-bold">Entre em contato</p>
                <p className="text-sm text-[#ECECEC]/70">Fale com a Império Imóveis pelo WhatsApp.</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-[#ECECEC]/70 transition hover:bg-white/10 hover:text-[#ECECEC]"
              onClick={() => setOpen(false)}
              aria-label="Fechar contato pelo WhatsApp"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-bold text-[#111214] transition hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" />
            Chamar no WhatsApp
          </a>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#111214] shadow-xl shadow-black/40 transition hover:scale-105"
        aria-label="Abrir WhatsApp da Império Imóveis"
        onMouseEnter={() => setOpen(true)}
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
