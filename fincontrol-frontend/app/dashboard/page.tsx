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
  Printer, LogOut, Pencil, Trash2, Plus, Target
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
  
  // Estados de Dados
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]); // 🚀 NOVO: Lista de Caixinhas
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false); // 🚀 NOVO: Modal Criar Caixinha
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false); // Modal Movimentar (Guardar/Resgatar)
  
  // Estados para Edição e Ação
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null); // 🚀 NOVO: Qual caixinha estou mexendo

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  // Estados Formulários
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState(''); 
  const [tType, setTType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [cat, setCat] = useState('OTHER');

  const [goalName, setGoalName] = useState(''); // 🚀 NOVO: Nome da nova caixinha
  const [goalTarget, setGoalTarget] = useState(''); // 🚀 NOVO: Meta da nova caixinha
  const [vaultAmount, setVaultAmount] = useState(''); 
  const [vaultAction, setVaultAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return (Number(digits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const parseCurrencyToNumber = (value: string) => {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  };

  // 🔌 CARGA DE DADOS (TRANSAÇÕES + CAIXINHAS)
  const loadData = useCallback(async () => {
    try {
      const [resTx, resGoals] = await Promise.all([
        api.get('/transactions?limit=1000'),
        api.get('/goals') // 🚀 NOVO: Endpoint do Backend
      ]);
      setTransactions(resTx.data.data || []);
      setGoals(resGoals.data || []);
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

  // 🚀 FUNÇÃO PARA DELETAR TRANSAÇÃO
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
    setVal(formatCurrency((t.amount * 100).toString()));
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

  // 🧠 CÁLCULOS
  const totalInVault = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.current, 0);
  }, [goals]);

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
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [filteredTransactions]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + t.amount;
    });
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    return Object.entries(stats).map(([key, value]) => ({
      key,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // 🚀 ADICIONAR/EDITAR TRANSAÇÃO
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseCurrencyToNumber(val);
    if (!desc || numericAmount <= 0) return;
    
    try {
      if (isEditing && currentId) {
        await api.patch(`/transactions/${currentId}`, {
          description: desc, amount: numericAmount, type: tType, category: cat, date: new Date().toISOString()
        });
      } else {
        await api.post('/transactions', {
          description: desc, amount: numericAmount, type: tType, category: cat, date: new Date().toISOString()
        });
      }
      setIsModalOpen(false); setIsEditing(false); setCurrentId(null); setDesc(''); setVal('');
      await loadData();
    } catch (err) {
      alert("Erro ao processar transação.");
    }
  };

  // 🚀 CRIAR NOVA CAIXINHA
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseCurrencyToNumber(goalTarget);
    if (!goalName || target <= 0) return;
    try {
      await api.post('/goals', { name: goalName, target });
      setIsGoalModalOpen(false); setGoalName(''); setGoalTarget('');
      await loadData();
    } catch (err) {
      alert("Erro ao criar caixinha.");
    }
  };

  // 🚀 MOVIMENTAR DINHEIRO NA CAIXINHA (GUARDAR/RESGATAR)
  const handleVaultOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyToNumber(vaultAmount);
    if (!amount || !selectedGoal) return;

    try {
      const endpoint = vaultAction === 'DEPOSIT' ? 'deposit' : 'withdraw';
      await api.post(`/goals/${selectedGoal.id}/${endpoint}`, { amount });
      
      setIsVaultModalOpen(false); setVaultAmount(''); setSelectedGoal(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro na operação do cofre.");
    }
  };

  // 🚀 EXCLUIR CAIXINHA
  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Excluir caixinha? O saldo nela não retornará automaticamente.")) return;
    try {
      await api.delete(`/goals/${id}`);
      await loadData();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-black text-2xl animate-pulse italic">Acessando canal seguro...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex font-sans overflow-x-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

        select option { background-color: #111 !important; color: #fff !important; }

        @media print {
          aside, .no-print, button, .modal { display: none !important; }
          
          body { 
            background: white !important; 
            color: #1e293b !important; 
            padding: 0 !important; 
            margin: 0 !important;
            font-family: 'Inter', sans-serif !important;
          }

          main { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .print-only { display: block !important; }

          .pdf-container { padding: 50px; background: white; }

          .pdf-header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            padding: 40px; 
            border-radius: 30px; 
            color: white !important; 
            margin-bottom: 40px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
          }

          .pdf-header h1 { font-weight: 900; text-transform: uppercase; letter-spacing: -1px; font-style: italic; margin: 0; font-size: 28px; }
          .pdf-header p { opacity: 0.8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }

          .pdf-summary { 
            display: grid; 
            grid-template-cols: repeat(3, 1fr); 
            gap: 20px; 
            margin-bottom: 50px; 
          }

          .pdf-card { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 20px; 
            border: 1px solid #e2e8f0;
            text-align: center;
          }

          .pdf-card span { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .pdf-card h2 { font-size: 20px; font-weight: 900; margin-top: 5px; color: #1e293b; }
          .pdf-card.highlight { background: #4f46e5; border: none; }
          .pdf-card.highlight span, .pdf-card.highlight h2 { color: white !important; }

          .pdf-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
          .pdf-table th { 
            text-align: left; 
            padding: 15px; 
            font-size: 10px; 
            font-weight: 900; 
            color: #94a3b8; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            border-bottom: 2px solid #f1f5f9;
          }

          .pdf-table tr { background: #ffffff; }
          .pdf-table td { 
            padding: 18px 15px; 
            font-size: 12px; 
            color: #334155; 
            border-top: 1px solid #f1f5f9; 
            border-bottom: 1px solid #f1f5f9; 
          }

          .pdf-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 15px; border-bottom-left-radius: 15px; font-weight: 700; }
          .pdf-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 15px; border-bottom-right-radius: 15px; text-align: right; font-weight: 900; font-size: 14px; }

          .pdf-badge { 
            padding: 6px 12px; 
            border-radius: 8px; 
            font-size: 9px; 
            font-weight: 900; 
            text-transform: uppercase; 
          }
          .badge-income { background: #dcfce7; color: #15803d; }
          .badge-expense { background: #fee2e2; color: #b91c1c; }

          .pdf-footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
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
          </button>
          
          <button onClick={() => setActiveTab('TRANSACTIONS')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <div className="flex items-center gap-3"><Receipt size={20}/> Transações</div>
          </button>

          <button onClick={() => setActiveTab('VAULT')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all ${activeTab === 'VAULT' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <div className="flex items-center gap-3"><Lock size={20}/> Caixinhas</div>
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center justify-center gap-3 w-full p-4 border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
          <LogOut size={16}/> Sair
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* 🚀 RELATÓRIO PDF PREMIUM (Aparece apenas na impressão) */}
        <div className="print-only pdf-container">
          <div className="pdf-header">
            <div>
              <h1>FinControl <span style={{opacity: 0.6}}>SaaS</span></h1>
              <p>Relatório de Performance Financeira</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ marginBottom: '5px' }}>Emitido em</p>
              <h2 style={{ fontSize: '18px', fontWeight: 900 }}>{new Date().toLocaleDateString('pt-BR')}</h2>
            </div>
          </div>

          <div className="pdf-summary">
            <div className="pdf-card">
              <span>Receitas Totais</span>
              <h2 style={{ color: '#059669' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.income)}</h2>
            </div>
            <div className="pdf-card">
              <span>Despesas Totais</span>
              <h2 style={{ color: '#dc2626' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.expense)}</h2>
            </div>
            <div className="pdf-card highlight">
              <span>Saldo Consolidado</span>
              <h2>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}</h2>
            </div>
          </div>

          <table className="pdf-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => {
                const category = categoriesMap[t.category as keyof typeof categoriesMap] || categoriesMap.OTHER;
                return (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td style={{ textTransform: 'uppercase', fontWeight: 800, color: '#1e293b' }}>{t.description}</td>
                    <td>{category.label}</td>
                    <td>
                      <span className={`pdf-badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type === 'INCOME' ? 'Crédito' : 'Débito'}
                      </span>
                    </td>
                    <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pdf-footer">
            Este documento foi gerado automaticamente pelo sistema FinControl. Protegido por criptografia JWT.
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 no-print">
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 italic">Status Consolidado</p>
            <h1 className="text-5xl font-black text-white tracking-tighter capitalize">
              {activeTab === 'VAULT' ? 'Minhas Caixinhas' : activeTab}
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-sm font-black hover:bg-white/10 transition-all text-white">
              <Printer size={18}/> Imprimir PDF
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'VAULT') {
                  setIsGoalModalOpen(true);
                } else {
                  setIsEditing(false); setDesc(''); setVal(''); setIsModalOpen(true);
                }
              }} 
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-indigo-500 shadow-2xl shadow-indigo-600/40 transition-all"
            >
              <PlusCircle size={20}/> {activeTab === 'VAULT' ? 'Nova Caixinha' : 'Novo Lançamento'}
            </button>
          </div>
        </div>

        {/* Resumo Estilo Nubank Premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 no-print">
          <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[3rem] relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Unlock size={80} className="text-white"/></div>
             <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4 italic">Disponível (Circulante)</p>
             <h3 className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}</h3>
          </div>

          <div className="bg-indigo-600/[0.04] border border-indigo-600/20 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Lock size={80} className="text-indigo-500"/></div>
            <p className="text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-4 italic">Total em Caixinhas</p>
            <h3 className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInVault)}</h3>
          </div>

          <div className="bg-emerald-500/[0.04] border border-emerald-500/10 p-10 rounded-[3rem]">
            <p className="text-emerald-500 text-[11px] font-black uppercase tracking-widest mb-4 italic">Patrimônio Líquido</p>
            <h3 className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance + totalInVault)}</h3>
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === 'DASHBOARD' && (
          <div className="no-print">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3 mb-8">
                  <PieChartIcon size={20} className="text-indigo-500"/> Gastos por Categoria
                </h3>
                <div className="space-y-7">
                  {categoryStats.map(stat => {
                    const category = categoriesMap[stat.key as keyof typeof categoriesMap] || categoriesMap.OTHER;
                    return (
                      <div key={stat.key}>
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.bg} ${category.color}`}><category.icon size={14}/></div>
                            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{category.label}</span>
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
              <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-center gap-6">
                   <div className="flex items-center gap-6 p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                      <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Receitas</p>
                        <p className="text-3xl font-black text-white italic">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.income)}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                      <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"><TrendingDown size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Despesas</p>
                        <p className="text-3xl font-black text-white italic">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.expense)}</p>
                      </div>
                   </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions View */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="no-print space-y-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20}/>
                <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] py-5 pl-16 outline-none focus:border-indigo-500 transition-all text-white font-bold" />
              </div>
              <div className="flex items-center gap-4">
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-[#111] border border-white/5 rounded-[1.5rem] py-5 px-8 text-xs font-black text-white uppercase outline-none appearance-none cursor-pointer">
                  <option value="ALL">Todos os Meses</option>
                  {months.map((m, idx) => <option key={m} value={idx.toString()}>{m}</option>)}
                </select>
                <div className="flex p-1.5 bg-[#0f0f0f] rounded-[1.5rem] border border-white/5">
                  <button onClick={() => setFilterType('ALL')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterType === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}>Tudo</button>
                  <button onClick={() => setFilterType('INCOME')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterType === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}>Créditos</button>
                  <button onClick={() => setFilterType('EXPENSE')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-600 hover:text-slate-400'}`}>Débitos</button>
                </div>
              </div>
            </div>

            <div className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="divide-y divide-white/[0.03]">
                {filteredTransactions.map(t => {
                  const category = categoriesMap[t.category as keyof typeof categoriesMap] || categoriesMap.OTHER;
                  return (
                    <div key={t.id} className="flex items-center justify-between p-8 hover:bg-white/[0.02] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${category.bg} ${category.color}`}><category.icon size={22}/></div>
                        <div>
                          <p className="font-black text-xl text-white uppercase italic group-hover:text-indigo-400 transition-colors">{t.description}</p>
                          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-1.5">{category.label} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <p className={`text-2xl font-black italic tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                          {t.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all no-print">
                          <button onClick={() => handleEditClick(t)} className="p-3 bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-xl transition-all"><Pencil size={18}/></button>
                          <button onClick={() => handleDelete(t.id)} className="p-3 bg-white/5 hover:bg-rose-600 hover:text-white text-slate-500 rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 🚀 Vault View - Estilo Caixinhas Nubank */}
        {activeTab === 'VAULT' && (
          <div className="no-print animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white/[0.03] border border-white/10 p-10 rounded-[3.5rem] relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                    <div className="flex justify-between items-start mb-8">
                      <div className="p-4 bg-indigo-600/20 rounded-2xl text-indigo-500">
                        <Target size={28} />
                      </div>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                    
                    <h4 className="text-2xl font-black text-white italic mb-1 uppercase tracking-tighter">{goal.name}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">
                      Meta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target)}
                    </p>

                    <p className="text-4xl font-black text-white mb-6">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current)}
                    </p>

                    {/* Barra de Progresso Estilo Premium */}
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => {setSelectedGoal(goal); setVaultAction('DEPOSIT'); setVaultAmount(''); setIsVaultModalOpen(true);}} 
                        className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={() => {setSelectedGoal(goal); setVaultAction('WITHDRAW'); setVaultAmount(''); setIsVaultModalOpen(true);}} 
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                      >
                        Resgatar
                      </button>
                    </div>
                  </div>
                ))}

                {/* Card de Adicionar Nova Caixinha */}
                <button 
                  onClick={() => setIsGoalModalOpen(true)}
                  className="border-2 border-dashed border-white/10 p-10 rounded-[3.5rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-500/40 hover:bg-white/[0.01] transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-500 transition-all">
                    <Plus size={32} className="text-slate-600 group-hover:text-indigo-500"/>
                  </div>
                  <p className="font-black text-slate-500 uppercase text-xs tracking-widest group-hover:text-white transition-all">Nova Caixinha</p>
                </button>
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
              <button onClick={() => {setIsModalOpen(false); setIsEditing(false);}} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-8">
              <div className="flex gap-4 p-2 bg-black rounded-[2rem] border border-white/5">
                <button type="button" onClick={() => setTType('EXPENSE')} className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tType === 'EXPENSE' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-600'}`}>Despesa</button>
                <button type="button" onClick={() => setTType('INCOME')} className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tType === 'INCOME' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-600'}`}>Receita</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input required type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="O que foi?" className="bg-white/5 border border-white/5 p-6 rounded-[1.5rem] outline-none text-white font-bold" />
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

      {/* 🚀 MODAL CRIAR CAIXINHA (NEW) */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nova Caixinha</h2>
               <button onClick={() => setIsGoalModalOpen(false)} className="p-3 bg-white/5 rounded-xl text-slate-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-6">
               <input required value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Nome do objetivo (ex: Viagem)..." className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none text-white font-bold" />
               <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">Meta R$</span>
                <input required value={goalTarget} onChange={e => setGoalTarget(formatCurrency(e.target.value))} placeholder="0,00" className="w-full bg-white/5 border border-white/10 p-6 pl-24 rounded-2xl outline-none text-xl font-black text-white" />
               </div>
               <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">Criar Objetivo</button>
            </form>
          </div>
        </div>
      )}

      {/* 💰 MODAL MOVIMENTAR CAIXINHA (GUARDAR/RESGATAR) */}
      {isVaultModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 no-print">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${vaultAction === 'DEPOSIT' ? 'bg-indigo-600' : 'bg-emerald-600'}`}></div>
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                 {vaultAction === 'DEPOSIT' ? `Guardar em: ${selectedGoal.name}` : `Resgatar de: ${selectedGoal.name}`}
               </h2>
               <button onClick={() => setIsVaultModalOpen(false)} className="p-3 bg-white/5 rounded-xl text-slate-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleVaultOperation} className="space-y-6">
               <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 font-black text-2xl">R$</span>
                <input required type="text" value={vaultAmount} onChange={e => setVaultAmount(formatCurrency(e.target.value))} placeholder="0,00" className="w-full bg-white/5 border border-white/10 p-8 pl-16 rounded-3xl outline-none text-4xl font-black text-white text-center" />
               </div>
               <button type="submit" className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${vaultAction === 'DEPOSIT' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white shadow-xl`}>
                 Confirmar {vaultAction === 'DEPOSIT' ? 'Depósito' : 'Resgate'}
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}