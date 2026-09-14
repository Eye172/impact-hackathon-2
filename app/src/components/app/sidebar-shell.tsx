"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { GlassSidebar } from "@/components/shared/sidebar";
import {
  CareerLockedScreen,
  REQUIRED_CAREER_STEPS,
  isUniversityRoute,
} from "@/components/app/career-access";
import { JourneyHints } from "@/components/app/journey-hints";

const COLLAPSED_W = 64;
const EXPANDED_W = 240;
const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState(false);
  const [access, setAccess] = React.useState<{ ready: boolean; unlocked: boolean; completed: number }>({
    ready: false,
    unlocked: false,
    completed: 0,
  });

  React.useEffect(() => {
    let live = true;
    fetch("/api/career/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!live) return;
        const completedSteps: string[] = data?.completedSteps ?? [];
        const completed = REQUIRED_CAREER_STEPS.filter((step) => completedSteps.includes(step)).length;
        setAccess({ ready: true, unlocked: completed === REQUIRED_CAREER_STEPS.length, completed });
      })
      .catch(() => live && setAccess({ ready: true, unlocked: false, completed: 0 }));
    return () => {
      live = false;
    };
  }, [pathname]);

  const protectedRoute = isUniversityRoute(pathname);

  return (
    <div className="flex min-h-screen">
      <GlassSidebar
        expanded={expanded}
        careerUnlocked={access.ready && access.unlocked}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      />
      <motion.div
        className="flex-1 min-w-0"
        animate={{ paddingLeft: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={SPRING}
        style={{ willChange: "padding-left" }}
      >
        {protectedRoute && !access.ready ? (
          <main className="flex min-h-screen items-center justify-center">
            <span className="mono-label">Проверяю готовность маршрута…</span>
          </main>
        ) : protectedRoute && !access.unlocked ? (
          <CareerLockedScreen completed={access.completed} />
        ) : (
          children
        )}
      </motion.div>
      <JourneyHints />
    </div>
  );
}
