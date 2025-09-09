import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 stable-layout">
      <Header />
      <main className="container mx-auto px-6 py-8 optimized-container">
        {children}
      </main>
    </div>
  );
}
