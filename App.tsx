import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { ShoppingList } from './pages/ShoppingList';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center text-white">Chargement GIVD...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        
        <Route path="/" element={session ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" />} />
        <Route path="/inventory" element={session ? <Layout><Inventory /></Layout> : <Navigate to="/auth" />} />
        <Route path="/shopping-list" element={session ? <Layout><ShoppingList /></Layout> : <Navigate to="/auth" />} />
        <Route path="/settings" element={session ? <Layout><Settings /></Layout> : <Navigate to="/auth" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;