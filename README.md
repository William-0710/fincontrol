# 💰 FinControl — SaaS de Gestão Financeira

Aplicação fullstack profissional para controle financeiro pessoal, desenvolvida com arquitetura moderna em nuvem, autenticação JWT e dashboard dinâmico em tempo real.

---

## 🌐 Acesso ao Projeto

* **🔗 Frontend (Vercel):** [https://fincontrol-frontend.vercel.app](https://fincontrol-frontend.vercel.app)
* **🔗 API (Railway):** [https://fincontrol-backend-production.up.railway.app](https://fincontrol-backend-production.up.railway.app)

---

## 🧠 Arquitetura do Sistema

O sistema foi estruturado seguindo a separação clara de responsabilidades entre as camadas:


**Fluxo de Dados:**
`Frontend (Next.js)` ↔ `Backend (NestJS)` ↔ `Database (PostgreSQL via Prisma)`

---

## ⚙️ Stack Tecnológica

### **Frontend**
* **Next.js 14+** (App Router)
* **Tailwind CSS** (UI/UX Responsivo)
* **TypeScript** (Tipagem Estrita)
* **Lucide React** (Icons)

### **Backend**
* **NestJS** (Arquitetura Modular)
* **Prisma ORM** (Modelagem de Dados)
* **JWT Authentication** (Segurança)
* **ValidationPipe** (Data Integrity)

### **Infraestrutura**
* **Vercel:** Hosting Frontend
* **Railway:** Hosting Backend Node.js
* **Supabase:** PostgreSQL Database Managed

---

## ✨ Funcionalidades

- **🔐 Autenticação Segura:** Login e registro com proteção JWT.
- **📊 Dashboard Financeiro:** Resumo de saldo circulante e patrimônio líquido em tempo real.
- **💸 CRUD de Transações:** Histórico detalhado com edição e exclusão.
- **📦 Caixinhas (Multi-objetivos):** Sistema estilo Nubank para criar metas específicas (Carro, Reserva, Viagem).
- **🏦 Lógica de Cofre:** Movimentação entre saldo disponível e capital protegido.
- **📄 Relatórios PDF:** Exportação de extratos com design premium via CSS Print.

---

## 📸 Preview do Dashboard

<img width="1861" height="940" alt="image" src="https://github.com/user-attachments/assets/453801a8-759a-4965-872c-39b33cf8de15" />

---

## 🔐 Segurança e Boas Práticas

* Proteção de rotas privadas via Middleware no Next.js.
* Validação global de inputs no Backend.
* CORS configurado para aceitar apenas requisições do domínio oficial.
* Isolamento total de variáveis de ambiente (`.env`).

---
📈 Aprendizados Técnicos
Este projeto envolveu desafios reais de engenharia de software:

Deploy Distribuído: Orquestração de ambientes distintos (Vercel + Railway + Supabase).

Conexão Resiliente: Uso de Connection Pooling para estabilidade do banco de dados.

User Experience: Implementação de máscaras de moeda e estados complexos no React.

Segurança Cloud: Debug de logs e gerenciamento de variáveis de ambiente em produção.

👨‍💻 Autor
William Correia de Andrade Estudante de Análise e Desenvolvimento de Sistemas | Especialização em IA 

💻 GitHub: https://github.com/William-0710

🔗 LinkedIn: https://www.linkedin.com/in/william-correia-de-andrade/

## ⚙️ Configuração Local

### 1. Clone o repositório
```bash
git clone [https://github.com/William-0710/fincontrol.git](https://github.com/William-0710/fincontrol.git)
cd fincontrol

cd fincontrol-backend
npm install
# Crie o .env com DATABASE_URL e JWT_SECRET
npx prisma generate
npm run start:dev

cd ../fincontrol-frontend
npm install
# Crie o .env com NEXT_PUBLIC_API_URL=http://localhost:3333
npm run dev

