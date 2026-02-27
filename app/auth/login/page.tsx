"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Credenciales inválidas. Verifica tu email y contraseña.");
      } else {
        router.push("/app/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/app/dashboard` },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Revisa tu email para confirmar tu cuenta.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-valo-bg flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.05) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="fixed left-0 top-0 w-1/2 h-full bg-gradient-to-r from-valo-accent/3 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div
            className="w-10 h-10 bg-valo-accent/15 border border-valo-accent/40 flex items-center justify-center text-valo-accent font-mono text-sm font-black"
            style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
          >
            CP
          </div>
          <span className="font-mono text-valo-text font-bold tracking-wider">
            CEPREVAL<span className="text-valo-accent">PREP</span>
          </span>
        </div>

        {/* Panel */}
        <div
          className="bg-valo-panel border border-valo-border p-8"
          style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}
        >
          {/* Tab toggle */}
          <div className="flex mb-8 border-b border-valo-border">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 pb-3 font-mono text-xs tracking-widest uppercase transition-colors ${
                  mode === m
                    ? "text-valo-accent border-b-2 border-valo-accent -mb-px"
                    : "text-valo-muted hover:text-valo-text"
                }`}
              >
                {m === "login" ? "INICIAR SESIÓN" : "REGISTRARSE"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-mono text-xs text-valo-muted tracking-widest mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-valo-surface border border-valo-border text-valo-text px-4 py-3 font-mono text-sm focus:outline-none focus:border-valo-accent/60 transition-colors placeholder-valo-muted-2"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                placeholder="usuario@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-xs text-valo-muted tracking-widest mb-2">
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-valo-surface border border-valo-border text-valo-text px-4 py-3 pr-12 font-mono text-sm focus:outline-none focus:border-valo-accent/60 transition-colors placeholder-valo-muted-2"
                  style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-valo-muted hover:text-valo-text transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-valo-red/40 bg-valo-red/10 px-4 py-3 text-valo-red font-mono text-xs"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
              >
                ⚠ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-valo-green/40 bg-valo-green/10 px-4 py-3 text-valo-green font-mono text-xs"
                style={{ clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)" }}
              >
                ✓ {success}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full bg-valo-accent text-valo-bg font-mono font-black text-sm tracking-widest py-3.5 hover:bg-valo-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-accent"
              style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {mode === "login" ? "ENTRAR" : "CREAR CUENTA"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-valo-muted-2 font-mono text-xs mt-6">
          <Link href="/" className="hover:text-valo-muted transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
