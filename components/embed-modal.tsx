import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useTheme } from "next-themes";

interface EmbedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedCode: string;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  children: ReactNode; 
}

export default function EmbedModal({ open, onOpenChange, embedCode, copied, setCopied, children }: EmbedModalProps) {
  const { theme } = useTheme();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-lg md:max-w-xl p-0 overflow-visible flex flex-col items-center justify-center">
        <div className={cn(
          "rounded-2xl shadow-lg border border-border bg-background w-full",
          theme === 'dark' ? 'bg-[#18181b]' : 'bg-white'
        )}>
          <div className="px-4 sm:px-6 pt-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-semibold text-center w-full">Embeddable Widget Generator</DialogTitle>
            </DialogHeader>
            <div className="mt-4 mb-2 text-sm sm:text-base font-medium">Embed Code</div>
            <div className={cn(
              "rounded-lg px-3 sm:px-4 py-2 sm:py-3 mb-4 text-xs sm:text-sm border flex items-start gap-3",
              theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800 text-zinc-300' : 'bg-orange-50/60 border-orange-100 text-zinc-700'
            )}>
              <div>
                <span className="font-semibold">Note on styling</span><br />
                <span>We recommend that you adjust the <span className="font-mono font-semibold">style</span> property on the generated code to fit your needs</span>
              </div>
            </div>
            <div className={cn(
              "rounded-lg bg-muted border border-border px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm flex items-center justify-between overflow-x-auto",
              theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
            )} style={{wordBreak: 'break-all'}}>
              <span className="truncate select-all whitespace-pre-line">{embedCode}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 px-4 sm:px-6 pb-6 pt-2 w-full">
            <button
              type="button"
              style={{ background: '#ff7300', color: 'white', fontWeight: 600, borderRadius: '0.375rem', padding: '0.5rem 1.5rem', width: '100%', maxWidth: '100%', border: 'none', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => {
                navigator.clipboard.writeText(embedCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 