import { redirect } from 'next/navigation';

export default function Home() {
  // Assim que o usuário acessar http://localhost:3000, ele é jogado para a tela de login
  redirect('/login');
}