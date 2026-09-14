"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ActionButton } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(
          result?.error === "CredentialsSignin"
            ? "Почта или пароль не подходят."
            : "Войти не получилось. Попробуй ещё раз.",
        );
        setSubmitting(false);
        return;
      }

      router.replace("/navigator");
    } catch {
      setError("Что-то пошло не так. Попробуй ещё раз.");
      setSubmitting(false);
    }
  }

  const field =
    "w-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 " +
    "text-[length:var(--text-fluid-sm)] outline-none transition-colors " +
    "focus:border-[color:var(--color-accent)]";

  return (
    <section className="plate w-full max-w-md p-8">
      <div className="mono-label">Вход · лист 00</div>

      <h1 className="display-tight mt-3 text-[length:var(--text-fluid-2xl)]">
        С возвращением
      </h1>
      <p className="mt-2 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
        Твой лист профиля сохранён — маршрут продолжится с того же места.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label htmlFor="email" className="mono-label mb-2 block">
            Почта
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="password" className="mono-label mb-2 block">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </div>

        {error && (
          <p className="border-l-2 border-[color:var(--color-crimson)] pl-3 text-[length:var(--text-fluid-sm)] text-[color:var(--color-crimson)]">
            {error}
          </p>
        )}

        <ActionButton type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Проверяю…" : "Войти"}
        </ActionButton>
      </form>

      <p className="mt-6 text-center text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
        Ещё нет аккаунта?{" "}
        <Link
          href="/register"
          className="text-[color:var(--color-accent)] underline underline-offset-4"
        >
          Создать
        </Link>
      </p>

      <p className="mono-label mt-5 text-center">demo · aliya@qapp.kz / password123</p>
    </section>
  );
}
