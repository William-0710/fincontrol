"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, User, Mail, Lock } from "lucide-react";
import { api } from "../../services/api";

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
      // 1. Cria a conta
      const response = await api.post("/auth/register", { name, email, password });
      
      // 🛡️ 2. Auto-Login: Busca o token que o backend deve retornar no registro
      const token = response.data.access_token || response.data.accessToken || response.data.token;

      if (token) {
        // Grava no LocalStorage
        localStorage.setItem('fincontrol.token', token);
        
        // 🚀 Grava no COOKIE (Vital para o Middleware funcionar)
        document.cookie = `fincontrol.token=${token}; path=/; max-age=86400; SameSite=Lax`;

        // Vai direto para o Dashboard
        window.location.href = '/dashboard';
      } else {
        // Se o seu backend não loga automaticamente, mandamos para o login
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Erro no registro:", err);
      setError(err.response?.data?.message || "Erro ao criar conta. Tente outro e-mail.");
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
            <h1 className="text-3xl font-black text-white tracking-tighter italic">
              Fin<span className="text-indigo-500">Control</span>
            </h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Crie sua conta</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Nome */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                required
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white transition-all font-medium"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                required
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white transition-all font-medium"
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                required
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "A criar..." : (
                <>
                  Criar Conta <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Já tem conta?{" "}
            <Link href="/login" className="text-white hover:text-indigo-400 font-bold transition-colors">
              Fazer login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}