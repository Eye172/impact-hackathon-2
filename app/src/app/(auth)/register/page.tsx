"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { StepAccount } from "@/components/registration/step-account";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function createAccount(data: { name: string; email: string; password: string }) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Не получилось создать аккаунт.");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (!result?.ok) {
        setError("Аккаунт создан. Войди с новой почтой и паролем.");
        return;
      }

      router.replace("/navigator");
      router.refresh();
    } catch {
      setError("Что-то пошло не так. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md">
      <div className="mb-5 flex items-center justify-between border-t border-[color:var(--color-text)] pt-3">
        <span className="mono-label text-[color:var(--color-accent)]">Старт · 01</span>
        <span className="mono-label">только аккаунт</span>
      </div>

      <div className="plate p-8">
        <h1 className="display-tight text-[length:var(--text-fluid-2xl)]">Создай точку старта</h1>
        <p className="mt-3 text-[length:var(--text-fluid-sm)] leading-relaxed text-[color:var(--color-muted)]">
          Никаких преждевременных приоритетов. Интересы, ценности и условия учёбы
          соберём постепенно — когда у тебя будет контекст для выбора.
        </p>

        <div className="mt-7">
          <StepAccount onNext={createAccount} loading={loading} error={error} />
        </div>
      </div>

      <p className="mt-6 text-center text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-[color:var(--color-accent)] underline underline-offset-4">
          Войти
        </Link>
      </p>
    </section>
  );
}
