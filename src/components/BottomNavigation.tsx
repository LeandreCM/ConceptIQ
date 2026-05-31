import type { ReactNode } from "react";
import type { PageKey } from "../types";

interface BottomNavigationItem {
  key: PageKey;
  label: string;
  icon: ReactNode;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function BottomNavigation({ items, activePage, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/92 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
        {items.map((item) => {
          const active = item.key === activePage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-bold transition duration-200 sm:px-2 sm:text-xs ${
                active ? "bg-pulse text-ink shadow-glow" : "text-white/58 hover:bg-white/8 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
