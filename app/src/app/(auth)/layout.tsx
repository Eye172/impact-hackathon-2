import type { ReactNode } from "react";
import { Terrain } from "@/components/compass/terrain";
import { CompassWordmark } from "@/components/ui/compass-mark";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12">
      <Terrain interactive={false} />

      {/* Sheet corner ticks */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-6 top-6 h-4 w-4 border-l border-t border-[color:var(--color-accent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-6 h-4 w-4 border-b border-r border-[color:var(--color-accent)]"
      />

      <div className="relative z-[1] flex w-full flex-col items-center gap-8">
        <div className="select-none">
          <CompassWordmark size={38} />
        </div>
        {children}
      </div>

      <span className="mono-label absolute bottom-6 left-1/2 -translate-x-1/2">
        Карьерный навигатор · 9–11 класс
      </span>
    </main>
  );
}
