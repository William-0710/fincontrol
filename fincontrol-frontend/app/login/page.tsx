"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // SOLUÇÃO: Procura o token em todas as variações comuns!
      const token = response.data.access_token || response.data.accessToken || response.data.token;

      if (token) {
        // Grava o token verdadeiro
        localStorage.setItem('fincontrol.token', token);
        // Redireciona para o Dashboard
        window.location.href = '/dashboard';
      } else {
        // Se realmente não vier nenhum token, mostra o erro na tela para não quebrar o sistema
        console.error("Resposta do backend sem token:", response.data);
        setError('Falha de sistema: O servidor não enviou o seu passe de acesso.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      
      <div className="relative z-10 w-full max-w-[1100px] flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl">
              <Activity className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-black text-white">FinControl</h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Bem-vindo de volta!</h2>
          <p className="text-slate-400 text-lg">Insira os seus dados para aceder à sua conta.</p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-10 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-8">Login</h3>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    required type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white transition-all" 
                    placeholder="seu@email.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    required type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus:border-indigo-500/50 outline-none text-white transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
              >
                {loading ? 'A entrar...' : <>Entrar <ArrowRight size={20} /></>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Ainda não tem conta? <Link href="/register" className="text-white hover:text-indigo-400 font-bold transition-colors">Criar Agora</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}