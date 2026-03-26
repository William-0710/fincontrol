"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { 
  Activity, TrendingUp, TrendingDown, 
  LayoutDashboard, Receipt, Wallet, X, PlusCircle,
  Coffee, Car, Home, ShoppingBag, DollarSign,
  Search, FileText, Calendar, PieChart as PieChartIcon,
  ChevronDown, ArrowUpRight, ArrowDownRight,
  ChevronRight, Lock, Unlock, ArrowRightLeft,
  Printer, LogOut, Pencil, Trash2 // 🚀 Adicionados Pencil e Trash2
} from 'lucide-react';

const categoriesMap = {
  FOOD: { label: 'Alimentação', icon: Coffee, bg: 'bg-orange-500/20', fill: 'bg-orange-500', color: 'text-orange-500' },
  TRANSPORT: { label: 'Transporte', icon: Car, bg: 'bg-blue-500/20', fill: 'bg-blue-500', color: 'text-blue-500' },
  HOUSING: { label: 'Moradia', icon: Home, bg: 'bg-purple-500/20', fill: 'bg-purple-500', color: 'text-purple-500' },
  SHOPPING: { label: 'Compras', icon: ShoppingBag, bg: 'bg-pink-500/20', fill: 'bg-pink-500', color: 'text-pink-500' },
  SALARY: { label: 'Salário', icon: TrendingUp, bg: 'bg-emerald-500/20', fill: 'bg-emerald-500', color: 'text-emerald-500' },
  OTHER: { label: 'Outros', icon: DollarSign, bg: 'bg-slate-500/20', fill: 'bg-slate-500', color: 'text-slate-500' },
};

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function App() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'VAULT'>('DASHBOARD');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  
  // 🚀 ESTADOS PARA EDIÇÃO
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  const [desc, setDesc] = useState('');
  const [val, setVal] = useState(''); 
  const [tType, setTType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [cat, setCat] = useState('OTHER');

  const [vaultAmount, setVaultAmount] = useState(''); 
  const [vaultAction, setVaultAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const amount = (Number(digits) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    });
    return amount;
  };

  const parseCurrencyToNumber = (value: string) => {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  };

  const loadData = useCallback(async () => {
    try {
      const response = await api.get('/transactions?limit=1000');
      setTransactions(response.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('fincontrol.token');
        document.cookie = "fincontrol.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 🚀 FUNÇÃO PARA DELETAR
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      await loadData();
    } catch (err) {
      alert("Erro ao excluir transação.");
    }
  };

  // 🚀 FUNÇÃO PARA PREPARAR EDIÇÃO
  const handleEditClick = (t: any) => {
    setDesc(t.description);
    setVal(formatCurrency((t.amount * 100).toString())); // Preenche a máscara corretamente
    setTType(t.type);
    setCat(t.category);
    setCurrentId(t.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('fincontrol.token');
    document.cookie = "fincontrol.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  const vaultBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.description === 'Depósito no Cofre 🔒') return acc + t.amount;
      if (t.description === 'Resgate do Cofre 🔓') return acc - t.amount;
      return acc;
    }, 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'ALL' || t.type === filterType;
      const txDate = new Date(t.date);
      const matchesMonth = filterMonth === 'ALL' || txDate.getMonth() === parseInt(filterMonth);
      return matchesSearch && matchesType && matchesMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterType, filterMonth]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.description === 'Depósito no Cofre 🔒' || t.description === 'Resgate do Cofre 🔓') return acc;
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [filteredTransactions]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'EXPENSE' && t.description !== 'Depósito no Cofre 🔒').forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + t.amount;
    });
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    return Object.entries(stats).map(([key, value]) => ({
      key,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseCurrencyToNumber(val);
    if (!desc || numericAmount <= 0) return;
    
    try {
      if (isEditing && currentId) {
        // 🚀 CHAMADA DE UPDATE (PATCH)
        await api.patch(`/transactions/${currentId}`, {
          description: desc,
          amount: numericAmount,
          type: tType,
          category: cat,
          date: new Date().toISOString()
        });
      } else {
        // CHAMADA DE CREATE (POST)
        await api.post('/transactions', {
          description: desc,
          amount: numericAmount,
          type: tType,
          category: cat,
          date: new Date().toISOString()
        });
      }
      
      setIsModalOpen(false);
      setIsEditing(false);
      setCurrentId(null);
      setDesc(''); setVal('');
      await loadData();
    } catch (err) {
      alert("Erro ao processar transação.");
    }
  };

  const handleVaultOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyToNumber(vaultAmount);
    if (!amount || amount <= 0) return;

    try {
      if (vaultAction === 'DEPOSIT') {
        await api.post('/transactions', {
          description: 'Depósito no Cofre 🔒',
          amount: amount,
          type: 'EXPENSE',
          category: 'OTHER',
          date: new Date().toISOString()
        });
      } else {
        if (amount > vaultBalance) {
          alert("Saldo insuficiente no cofre!");
          return;
        }
        await api.post('/transactions', {
          description: 'Resgate do Cofre 🔓',
          amount: amount,
          type: 'INCOME',
          category: 'OTHER',
          date: new Date().toISOString()
        });
      }
      setIsVaultModalOpen(false);
      setVaultAmount('');
      await loadData();
    } catch (err) {
      alert("Erro na operação do cofre.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-black text-2xl animate-pulse italic">Acessando canal seguro...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex font-sans overflow-x-hidden">
      
      <style>{`
        select option { background-color: #111 !important; color: #fff !important; }
        @media print {
          aside, .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          main { width: 100% !important; padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .print-only { display: block !important; }
          .pdf-container { padding: 40px; font-family: 'Inter', sans-serif; }
          .pdf-header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; border-radius: 20px; color: white !important; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .pdf-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
          .pdf-table th { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 15px; text-align: left; }
          .pdf-table tr { background: #f8fafc; border-radius: 10px; }
          .pdf-table td { padding: 15px; font-size: 11px; color: #1e293b; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
          .pdf-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
          .pdf-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 10px; border-bottom-right-radius: 10px; text-align: right; font-weight: 800; }
          .pdf-badge { padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
          .badge-income { background: #dcfce7; color: #15803d; }
          .badge-expense { background: #fee2e2; color: #b91c1c; }
          .pdf-summary { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-top: 30px; }
          .summary-item { background: #f1f5f9; padding: 20px; border-radius: 15px; text-align: center; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#080808] p-8 hidden lg:flex flex-col no-print shrink-0">
        <div className="flex items-center gap-4 mb-14">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
            <Activity size={24} className="text-white"/>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Fin<span className="text-indigo-500">Control</span></span>
        </div>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all ${activeTab === 'DASHBOARD' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <div className="flex items-center gap-3"><LayoutDashboard size={20}/> Dashboard</div>
            {activeTab === 'DASHBOARD' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
          </button>
          
          <button onClick={() => setActiveTab('TRANSACTIONS')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <div className="flex items-center gap-3"><Receipt size={20}/> Transações</div>
            {activeTab === 'TRANSACTIONS' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
          </button>

          <button onClick={() => setActiveTab('VAULT')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all ${activeTab === 'VAULT' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <div className="flex items-center gap-3"><Lock size={20}/> Meu Cofre</div>
            {activeTab === 'VAULT' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center justify-center gap-3 w-full p-4 border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
          <LogOut size={16}/> Sair da Conta
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 no-print">
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 px-1">
              {activeTab === 'DASHBOARD' ? 'Seu Panorama Financeiro' : activeTab === 'TRANSACTIONS' ? 'Histórico Detalhado' : 'Reserva de Emergência'}
            </p>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              {activeTab === 'DASHBOARD' ? 'Dashboard' : activeTab === 'TRANSACTIONS' ? 'Transações' : 'Meu Cofre'}
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-sm font-black hover:bg-white/10 transition-all text-white">
              <Printer size={18}/> Imprimir PDF
            </button>
            <button 
              onClick={() => {
                setIsEditing(false); // Garante que abre em modo "Novo"
                setDesc(''); setVal('');
                activeTab === 'VAULT' ? setIsVaultModalOpen(true) : setIsModalOpen(true)
              }} 
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-indigo-500 shadow-2xl shadow-indigo-600/40 transition-all"
            >
              <PlusCircle size={20}/> {activeTab === 'VAULT' ? 'Operar Cofre' : 'Novo Lançamento'}
            </button>
          </div>
        </div>

        {/* Resumo Dinâmico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 no-print">
          <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[3rem] relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Unlock size={80} className="text-white"/>
             </div>
             <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4 italic">Disponível (Circulante)</p>
             <h3 className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}</h3>
             <div className="mt-6 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
               <Activity size={12}/> Dinheiro livre para uso
             </div>
          </div>

          <div className="bg-indigo-600/[0.04] border border-indigo-600/20 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Lock size={80} className="text-indigo-500"/>
             </div>
            <p className="text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-4 italic">Cofre (Reserva)</p>
            <h3 className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaultBalance)}</h3>
            <div className="mt-6 flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               <Lock size={12}/> Protegido / Não Circulante
             </div>
          </div>

          <div className="bg-emerald-500/[0.04] border border-emerald-500/10 p-10 rounded-[3rem]">
            <p className="text-emerald-500 text-[11px] font-black uppercase tracking-widest mb-4 italic">Patrimônio Líquido</p>
            <h3 className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance + vaultBalance)}</h3>
            <div className="mt-6 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
               <ArrowUpRight size={12}/> Soma Total dos Ativos
             </div>
          </div>
        </div>

        {/* DashBoard View */}
        {activeTab === 'DASHBOARD' && (
          <div className="no-print">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                    <PieChartIcon size={20} className="text-indigo-500"/> Gastos por Categoria
                  </h3>
                </div>
                <div className="space-y-7">
                  {categoryStats.length === 0 ? <p className="text-slate-600 font-bold text-center py-10">Nenhuma despesa registrada.</p> : null}
                  {categoryStats.map(stat => {
                    const category = categoriesMap[stat.key as keyof typeof categoriesMap] || categoriesMap.OTHER;
                    return (
                      <div key={stat.key} className="group">
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.bg} ${category.color}`}>
                              <category.icon size={14}/>
                            </div>
                            <span className="text-xs font-black text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">{category.label}</span>
                          </div>
                          <span className="text-xs font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.value)}</span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ease-out ${category.fill}`} style={{ width: `${stat.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Fluxo de Caixa</h3>
                </div>
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                   <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
                      <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Entradas</p>
                        <p className="text-2xl font-black text-white italic">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.income)}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
                      <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"><TrendingDown size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Saídas</p>
                        <p className="text-2xl font-black text-white italic">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.expense)}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions & Shared View */}
        {(activeTab === 'TRANSACTIONS' || activeTab === 'DASHBOARD') && (
          <div className={activeTab === 'DASHBOARD' ? 'mt-12 no-print' : 'no-print'}>
            <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20}/>
                <input 
                  type="text" 
                  placeholder="Pesquisar histórico..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-8 outline-none focus:border-indigo-500 transition-all text-sm text-white placeholder:text-slate-700 font-bold"
                />
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative w-full lg:w-56">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18}/>
                  <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-10 text-xs font-black text-white uppercase outline-none appearance-none cursor-pointer hover:bg-[#1a1a1a] transition-all"
                  >
                    <option value="ALL">Todos os Meses</option>
                    {months.map((m, idx) => (
                      <option key={m} value={idx.toString()}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={18}/>
                </div>

                <div className="flex p-1.5 bg-[#0f0f0f] rounded-[1.5rem] border border-white/5">
                  <button onClick={() => setFilterType('ALL')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterType === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}>Tudo</button>
                  <button onClick={() => setFilterType('INCOME')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterType === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}>Créditos</button>
                  <button onClick={() => setFilterType('EXPENSE')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterType === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-600 hover:text-slate-400'}`}>Débitos</button>
                </div>
              </div>
            </div>

            <div className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Lançamentos Recentes</h2>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredTransactions.length} registros</span>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {filteredTransactions.length === 0 ? <p className="p-10 text-center text-slate-600 font-bold">Nenhuma transação encontrada.</p> : null}
                {filteredTransactions.map(t => {
                  const category = categoriesMap[t.category as keyof typeof categoriesMap] || categoriesMap.OTHER;
                  // Ignora no histórico normal se for depósito do cofre (opcional, dependendo do gosto)
                  return (
                    <div key={t.id} className="flex items-center justify-between p-8 hover:bg-white/[0.02] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${category.bg} ${category.color}`}>
                          <category.icon size={26}/>
                        </div>
                        <div>
                          <p className="font-black text-xl text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase italic">{t.description}</p>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-1.5">{category.label} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      
                      {/* 🚀 BOTÕES DE AÇÃO (EDIÇÃO E EXCLUSÃO) */}
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className={`text-2xl font-black italic tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all no-print">
                          <button 
                            onClick={() => handleEditClick(t)}
                            className="p-3 bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-xl transition-all"
                            title="Editar"
                          >
                            <Pencil size={18}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-3 bg-white/5 hover:bg-rose-600 hover:text-white text-slate-500 rounded-xl transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Vault View - Simplificado */}
        {activeTab === 'VAULT' && (
          <div className="no-print animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-indigo-600 p-12 rounded-[3.5rem] relative overflow-hidden shadow-2xl text-white">
                   <Lock className="absolute bottom-0 right-0 p-8 text-white/10" size={240}/>
                   <h3 className="text-2xl font-black italic uppercase mb-2">Reserva Segura</h3>
                   <p className="opacity-70 text-sm font-bold uppercase tracking-widest mb-8">Capital Protegido</p>
                   <p className="text-6xl font-black tracking-tighter">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaultBalance)}
                   </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] flex flex-col justify-center">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500">
                        <ArrowRightLeft size={24}/>
                      </div>
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Movimentar Cofre</h4>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => {setVaultAction('DEPOSIT'); setIsVaultModalOpen(true);}} className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Guardar Dinheiro</button>
                      <button onClick={() => {setVaultAction('WITHDRAW'); setIsVaultModalOpen(true);}} className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Resgatar</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* 💰 MODAL TRANSAÇÃO (NOVO E EDIÇÃO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 no-print">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${isEditing ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button 
                onClick={() => {setIsModalOpen(false); setIsEditing(false);}} 
                className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"
              >
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-8">
              <div className="flex gap-4 p-2 bg-black rounded-[2rem] border border-white/5">
                <button type="button" onClick={() => setTType('EXPENSE')} className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tType === 'EXPENSE' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-600'}`}>Despesa / Débito</button>
                <button type="button" onClick={() => setTType('INCOME')} className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tType === 'INCOME' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-600'}`}>Receita / Crédito</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input required type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição..." className="bg-white/5 border border-white/5 p-6 rounded-[1.5rem] outline-none text-white font-bold placeholder:text-slate-700" />
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">R$</span>
                  <input required type="text" value={val} onChange={e => setVal(formatCurrency(e.target.value))} placeholder="0,00" className="w-full bg-white/5 border border-white/5 p-6 pl-14 rounded-[1.5rem] outline-none text-xl font-black text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(categoriesMap).map(([key, item]) => (
                  <button key={key} type="button" onClick={() => setCat(key)} className={`py-5 rounded-[1.5rem] border text-[9px] font-black uppercase transition-all flex flex-col items-center gap-2 ${cat === key ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                    <item.icon size={18}/> {item.label}
                  </button>
                ))}
              </div>

              <button type="submit" className={`w-full py-6 text-white font-black rounded-[1.5rem] transition-all shadow-2xl text-xs uppercase tracking-[0.3em] ${isEditing ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                {isEditing ? 'Salvar Alterações' : 'Confirmar Operação'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 💰 MODAL COFRE */}
      {isVaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 no-print">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${vaultAction === 'DEPOSIT' ? 'bg-indigo-600' : 'bg-emerald-600'}`}></div>
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                 {vaultAction === 'DEPOSIT' ? 'Guardar Dinheiro' : 'Resgatar do Cofre'}
               </h2>
               <button onClick={() => setIsVaultModalOpen(false)} className="p-3 bg-white/5 rounded-xl text-slate-500"><X size={20}/></button>
            </div>

            <form onSubmit={handleVaultOperation} className="space-y-6">
               <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 font-black text-2xl">R$</span>
                <input required type="text" value={vaultAmount} onChange={e => setVaultAmount(formatCurrency(e.target.value))} placeholder="0,00" className="w-full bg-white/5 border border-white/10 p-8 pl-16 rounded-3xl outline-none text-4xl font-black text-white text-center" />
               </div>
               <button type="submit" className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${vaultAction === 'DEPOSIT' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white shadow-xl`}>
                 {vaultAction === 'DEPOSIT' ? 'Confirmar Depósito' : 'Confirmar Resgate'}
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}