"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabaseReady = hasSupabaseEnv();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Configure o Supabase antes de acessar o painel.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage("E-mail ou senha inválidos.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-36">
      <form
        onSubmit={handleSubmit}
        className="glass-panel mx-auto max-w-md rounded-2xl border-horebe-gold/25 p-6 shadow-glow"
      >
        <div className="mb-6">
          <Logo size="lg" showText={false} />
        </div>
        <p className="font-display text-2xl text-horebe-soft">Monte Horebe</p>
        <h1 className="mt-2 font-display text-4xl text-horebe-soft">Acesso Administrativo</h1>
        <p className="mt-3 text-sm leading-7 text-horebe-gray">
          Entre para gerenciar o catálogo da Monte Horebe.
        </p>

        <div className="mt-6 grid gap-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading || !supabaseReady}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>

        {!supabaseReady ? (
          <p className="mt-4 rounded-2xl border border-horebe-gold/25 bg-horebe-gold/10 px-4 py-3 text-sm text-horebe-soft">
            Supabase ainda não configurado. Preencha o `.env.local` para ativar o login.
          </p>
        ) : null}

        {message ? <p className="mt-4 text-sm text-red-200">{message}</p> : null}

        <Link
          href="/catalogo"
          className="focus-ring mt-6 inline-flex rounded-lg text-sm text-horebe-gray hover:text-horebe-gold"
        >
          Voltar ao catálogo
        </Link>
      </form>
    </section>
  );
}
