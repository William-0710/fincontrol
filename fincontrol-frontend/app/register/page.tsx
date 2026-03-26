"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, User, Mail, Lock } from "lucide-react";
import { api } from "@/services/api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });

      router.push("/login");
    } catch (err: any) {
      setError("Erro ao criar conta. Tente outro e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden p-6">

      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-10 rounded-[2.5rem] shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl mb-4">
              <Activity className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white">FinControl</h1>
            <p className="text-slate-500 text-sm mt-1">Crie sua conta</p>
          </div>

          {error && (
            <div className="mb-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Nome */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white placeholder:text-slate-700"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white placeholder:text-slate-700"
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white placeholder:text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition disabled:bg-slate-800 disabled:text-slate-500"
            >
              {loading ? "Criando..." : (
                <>
                  Criar Conta <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            Já tem conta?{" "}
            <Link href="/login" className="text-white hover:text-indigo-400 font-bold">
              Fazer login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}