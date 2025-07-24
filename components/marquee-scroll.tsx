import { useEffect, useState, useRef } from 'react';
import { Container } from './ui';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

interface TokenData {
  id: string;
  name: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  imageUrl: string;
}

const MarqueeScroll = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://droomdroom.com/price/api/marquee-tokens`);
        let limitedTokens = response.data;

        if (limitedTokens.length < 8) {
          while (limitedTokens.length < 8) {
            limitedTokens = [...limitedTokens, ...limitedTokens];
          }
          limitedTokens = limitedTokens.slice(0, 8);
        }

        setTokens(limitedTokens);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching marquee tokens:', error);
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const formatPrice = (price: number): string | JSX.Element => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    } else if (price < 1 && price > 0) {
      const priceStr = price.toFixed(12);
      const decimalPart = priceStr.split('.')[1];
      
      // Count leading zeros after decimal
      let leadingZeros = 0;
      for (let i = 0; i < decimalPart.length; i++) {
        if (decimalPart[i] === '0') {
          leadingZeros++;
        } else {
          break;
        }
      }
      
      if (leadingZeros >= 2) {
        // Get the significant digits after leading zeros
        const significantDigits = decimalPart.substring(leadingZeros, leadingZeros + 4);
        return (
          <span>
            $0.
            <sub className="text-[0.8em] font-semibold opacity-90">
              {leadingZeros}
            </sub>
            {significantDigits}
          </span>
        );
      } else {
        return `$${price.toFixed(4)}`;
      }
    } else {
      return `$${price.toFixed(8)}`;
    }
  };

  const TokenItem = ({ token, isDuplicate = false }: { token: TokenData; isDuplicate?: boolean }) => (
    <div 
      className={cn(
        "group relative overflow-hidden flex-shrink-0",
        "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
        "border border-border/30 rounded-xl px-2 py-0.5",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/5",
        "hover:border-orange-500/30 hover:bg-gradient-to-br hover:from-card/90 hover:to-card/50",
        "cursor-pointer",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/0 before:to-orange-500/5",
        "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      )}
      onClick={() => handleClick(token)}
    >
      {/* Decorative background element - contained within token item */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-4 translate-x-4 transition-transform duration-700 opacity-40" />
      
      <div className="relative flex items-center gap-3 whitespace-nowrap">
        <div className="relative w-4 h-4 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
          <img 
            src={token.imageUrl} 
            alt={token.name} 
            width={16} 
            height={16} 
            className="w-full h-full object-cover transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-xs font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
            {token.name}
          </div>
          <div className={cn(
            "text-xs font-medium transition-colors duration-300",
            isDuplicate ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {token.ticker}
          </div>
        </div>
        
        <div className="text-xs font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 flex-shrink-0">
          {formatPrice(token.price)}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 px-1 py-0.5 rounded-full text-xs font-semibold flex-shrink-0",
          "transition-all duration-300 shadow-sm group-hover:shadow-md",
          "border border-opacity-30",
          token.priceChange24h >= 0
            ? "bg-gradient-to-r from-emerald-500/15 to-green-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 group-hover:from-emerald-500/25 group-hover:to-green-500/20"
            : "bg-gradient-to-r from-rose-500/15 to-red-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400 group-hover:from-rose-500/25 group-hover:to-red-500/20"
        )}>
          {token.priceChange24h >= 0 ? (
            <ArrowUp className="h-2 w-2 transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <ArrowDown className="h-2 w-2 transition-transform duration-300 group-hover:scale-110" />
          )}
          <span className="text-xs">{Math.abs(token.priceChange24h).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full relative bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border-b border-border/40 py-3 overflow-hidden">
        {/* Background pattern for loading state */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
        </div>
        
        <Container>
          <div className="flex gap-6 overflow-hidden h-[44px]">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="flex items-center animate-pulse gap-3 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/20 flex-shrink-0">
                <div className="h-6 w-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full transition-all duration-500"></div>
                <div className="h-4 w-20 bg-gradient-to-r from-muted/40 to-muted/20 rounded transition-all duration-500"></div>
                <div className="h-4 w-12 bg-gradient-to-r from-muted/40 to-muted/20 rounded transition-all duration-500"></div>
                <div className="h-4 w-16 bg-gradient-to-r from-muted/40 to-muted/20 rounded transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  const handleClick = (token: TokenData) => {
    const url = `https://droomdroom.com/price/${token.name.toLowerCase().replace(/ /g, '-')}-${token.ticker.toLowerCase()}`;
    window.open(url, '_blank');
  }

  return (
    <div className="w-full relative bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border-b border-border/40 py-2 overflow-hidden">
      {/* Background pattern - matches entity page */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      </div>
      
      {/* Animated background elements - contained and not causing overflow */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full -translate-y-8 translate-x-8 transition-transform duration-1000 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-400/5 to-transparent rounded-full translate-y-6 -translate-x-6 transition-transform duration-1000 opacity-60 pointer-events-none" />
      
      <div className="w-full overflow-hidden">
        <div 
          ref={marqueeRef}
          className="flex gap-3 animate-marquee"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content'
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {tokens.map((token) => (
            <TokenItem key={token.id} token={token} />
          ))}
          {tokens.map((token) => (
            <TokenItem key={`${token.id}-dup`} token={token} isDuplicate={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeScroll; 