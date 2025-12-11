import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Settings, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Stock', icon: Package, path: '/inventory' },
    { label: 'Courses', icon: ShoppingCart, path: '/shopping-list' },
    { label: 'Réglages', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1F1F1F]">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-givd-surface border-b-2 border-black sticky top-0 z-50">
        <h1 className="font-display font-black text-2xl text-givd-blue">GIVD.</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-givd-surface border-r-2 border-black transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="hidden md:block font-display font-black text-3xl text-givd-blue mb-8">GIVD.</h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 font-bold border-2 transition-all
                    ${isActive 
                      ? 'bg-givd-blue text-white border-black shadow-neo' 
                      : 'bg-transparent text-gray-400 border-transparent hover:border-gray-600'
                    }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 font-bold text-red-400 hover:bg-red-900/20 border-2 border-transparent hover:border-red-900 rounded-none transition-all"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};