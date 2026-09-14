"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { AIChatSheet } from "@/components/shared/ai-chat-sheet";
import {
  Calendar,
  Compass,
  LogOut,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
} from "@/components/ui/icon";
import { LockKeyhole } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { useSettingsStore, type Language } from "@/store/useSettingsStore";
import { useTranslation } from "@/lib/i18n";

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kz", label: "KZ" },
];

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };
const LABEL_SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };

/* ─── Nav items ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/navigator", navKey: "navigator", icon: TrendingUp, matchPaths: ["/navigator", "/major"], locked: false },
  { href: "/feed",     navKey: "feed",      icon: Compass,  matchPaths: ["/feed", "/university"], locked: true },
  { href: "/search",   navKey: "search",    icon: Search,   matchPaths: ["/search"], locked: true },
  { href: "/timeline", navKey: "deadlines", icon: Calendar, matchPaths: ["/timeline"], locked: true },
  { href: "/profile",  navKey: "profile",   icon: User,     matchPaths: ["/profile"], locked: false },
] as const;

/* ─── Single nav row ──────────────────────────────────────────────────────── */
function NavRow({
  href,
  label,
  icon: Icon,
  active,
  expanded,
  locked = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  expanded: boolean;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <div
        aria-disabled="true"
        title="Откроется после профориентации"
        className="relative flex h-10 cursor-not-allowed items-center overflow-hidden text-[color:var(--color-faint)] opacity-65"
      >
        <span className="flex w-10 shrink-0 items-center justify-center">
          <Icon size={17} />
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={LABEL_SPRING}
              className="flex min-w-0 flex-1 items-center justify-between gap-2 whitespace-nowrap text-[13px] font-medium"
            >
              {label}
              <LockKeyhole size={13} className="mr-3 shrink-0" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center h-10 rounded-none overflow-hidden",
        "transition-colors duration-150 select-none",
        active
          ? "bg-[color:var(--color-accent)] text-white"
          : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)] hover:text-[color:var(--color-accent)]",
      )}
      style={{ width: "100%" }}
    >
      {/* Icon — fixed 40px zone */}
      <span className="shrink-0 w-10 flex items-center justify-center">
        <Icon size={17} />
      </span>

      {/* Label — slides in when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={LABEL_SPRING}
            className="text-[13px] font-medium whitespace-nowrap leading-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Active left bar */}
      {active && (
        <motion.span
          layoutId="activeBar"
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/70"
        />
      )}
    </Link>
  );
}

/* ─── GlassSidebar ───────────────────────────────────────────────────────── */
export interface GlassSidebarProps {
  expanded: boolean;
  careerUnlocked?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function GlassSidebar({ expanded, careerUnlocked = true, onMouseEnter, onMouseLeave }: GlassSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { language, theme, setLanguage, toggleTheme } = useSettingsStore();
  const t = useTranslation();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <motion.aside
      animate={{ width: expanded ? 240 : 64 }}
      transition={SPRING}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-0 top-0 bottom-0 flex flex-col py-5 overflow-hidden"
      style={{
        zIndex: "var(--z-sidebar)",
        background: "var(--color-surface-glass)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderRight: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sidebar)",
        willChange: "width",
      }}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <Link
        href="/navigator"
        className="flex items-center h-10 px-3 mb-5 gap-2.5 select-none"
        aria-label="Compass — на главную"
      >
        <span
          aria-hidden
          className="grid h-[30px] w-[30px] shrink-0 place-items-center border border-[color:var(--color-accent)]"
        >
          <span className="h-[9px] w-[9px] rotate-45 bg-[color:var(--color-accent)]" />
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.span
              key="brand-text"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={LABEL_SPRING}
              className="whitespace-nowrap text-[15px] font-extrabold"
              style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
            >
              Compass
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, navKey, icon, matchPaths, locked }) => {
          const active = (matchPaths as readonly string[]).some((p) => pathname?.startsWith(p));
          return (
            <NavRow
              key={href}
              href={href}
              label={t.nav[navKey]}
              icon={icon}
              active={active}
              expanded={expanded}
              locked={locked && !careerUnlocked}
            />
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-[color:var(--color-border)]" />

      {/* ИИ-навигатор */}
      <div className="px-3">
        <AIChatSheet
          trigger={
            <button
              type="button"
              className={cn(
                "flex items-center h-10 w-full rounded-none overflow-hidden",
                "bg-[color:var(--color-tag-match)] text-[color:var(--color-accent)]",
                "hover:bg-[color:var(--color-accent)] hover:text-white transition-colors duration-150",
              )}
            >
              <span className="shrink-0 w-10 flex items-center justify-center">
                <Sparkles size={17} />
              </span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    key="ai-label"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={LABEL_SPRING}
                    className="text-[13px] font-medium whitespace-nowrap leading-none"
                  >
                    ИИ-навигатор
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          }
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom controls */}
      <div className="flex flex-col gap-1 px-3">

        {/* Lang + Theme — only when expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="lang-theme"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Language chips */}
              <div className="flex gap-1 px-1 mb-1">
                {LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "flex-1 text-[10px] font-bold rounded-lg py-1.5 transition-all",
                      language === code
                        ? "bg-[color:var(--color-accent)] text-white"
                        : "text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center h-9 w-full rounded-none px-3 gap-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent)]/10 hover:text-[color:var(--color-accent)] transition-colors duration-150 mb-1"
              >
                <span className="text-[15px]">{theme === "dark" ? "🌙" : "☀️"}</span>
                <span className="text-[12px] font-medium whitespace-nowrap">
                  {theme === "dark" ? t.settings.themeDark : t.settings.themeLight}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center h-10 rounded-none overflow-hidden",
            "text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent)]/10 hover:text-[color:var(--color-text)] transition-colors duration-150",
            pathname?.startsWith("/settings") && "bg-[color:var(--color-accent)] text-white",
          )}
        >
          <span className="shrink-0 w-10 flex items-center justify-center">
            <Settings size={17} />
          </span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="settings-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={LABEL_SPRING}
                className="text-[13px] font-medium whitespace-nowrap leading-none"
              >
                {t.settings.title}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Sign out */}
        {status === "authenticated" && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center h-10 w-full rounded-none overflow-hidden text-[color:var(--color-muted)] hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <span className="shrink-0 w-10 flex items-center justify-center">
              <LogOut size={17} />
            </span>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  key="logout-label"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={LABEL_SPRING}
                  className="text-[13px] font-medium whitespace-nowrap leading-none"
                >
                  {t.settings.signOut}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  );
}

/* ─── Legacy export kept for compatibility ───────────────────────────────── */
export { GlassSidebar as Sidebar };
