import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProvider } from "@/components/app/session-provider";
import { ThemeApplier } from "@/components/app/theme-applier";
import "./globals.css";
import { cn } from "@/lib/tailwind-utils";

// Fonts are self-hosted in /public/fonts and declared in globals.css.
// next/font/google is deliberately not used: outbound TLS to fonts.googleapis.com
// is intercepted on the build machine and the download fails silently.

export const metadata: Metadata = {
  title: "Compass — карьерный навигатор",
  description:
    "Профиль школьника как рельеф: интересы задают высоты, специальности лежат на местности, план действий — маршрут между ними.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={cn(
          "min-h-screen antialiased",
          "bg-[color:var(--color-bg)] text-[color:var(--color-text)]",
        )}
      >
        <SessionProvider>
          <ThemeApplier />
          {children}
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
