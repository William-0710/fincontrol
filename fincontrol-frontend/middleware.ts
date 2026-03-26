import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Pega o token dos cookies (o lugar mais seguro para o Middleware ler)
  // Nota: Para o middleware funcionar 100%, o ideal é salvar o token em Cookie, 
  // mas vamos checar se ele existe para redirecionar.
  const token = request.cookies.get('fincontrol.token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Se o usuário NÃO está logado e tenta acessar o Dashboard
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Se o usuário JÁ está logado e tenta ir para Login ou Cadastro (não faz sentido)
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// ⚙️ Configuração: Em quais páginas o "Leão de Chácara" deve atuar?
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};