import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { ShoppingList } from './pages/ShoppingList';
import { Settings } from './pages/Settings';

// DIAGNOSTIC COMPONENT
const SystemStatus = ({ dbStatus }: { dbStatus: string }) => (
  <div className="bg-givd-dark border-b border-gray-700 p-2 flex justify-between items-center text-xs font-mono">
    <div className="flex items-center gap-2">
      <span className="bg-green-500 text-black px-2 py-0.5 rounded font-bold">
        GIVD_SYSTEM_OK
      </span>
      <span className="text-gray-400">Rendering Engine: Active</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={dbStatus.includes('Connected') ? "text-green-400" : "text-red-400"}>
        DB: {dbStatus}
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("Checking...");

  useEffect(() => {
    // 1. Check Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("Session Error:", err);
      setLoading(false);
    });

    // 2. Auth Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Test Database Connection
    const testConnection = async () => {
      try {
        // Attempt to fetch 1 product just to verify connection
        const { error } = await supabase.from('products').select('id').limit(1);
        if (error) {
          console.error("Supabase Error:", error);
          setDbStatus(`Error: ${error.message}`);
        } else {
          setDbStatus("Connected");
        }
      } catch (e: any) {
        setDbStatus(`Connection Failed: ${e.message}`);
      }
    };
    testConnection();

    return () => subscription.unsubscribe();
  }, []);

  // Visual Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex flex-col items-center justify-center text-white gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-givd-blue"></div>
        <p className="font-mono text-givd-green">Chargement GIVD...</p>
        <p className="text-xs text-gray-500">Initialisation Supabase & IA</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white">
       {/* Always render Status Bar during debug phase */}
      <SystemStatus dbStatus={dbStatus} />
      
      <HashRouter>
        <Routes>
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
          
          <Route path="/" element={session ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" />} />
          <Route path="/inventory" element={session ? <Layout><Inventory /></Layout> : <Navigate to="/auth" />} />
          <Route path="/shopping-list" element={session ? <Layout><ShoppingList /></Layout> : <Navigate to="/auth" />} />
          <Route path="/settings" element={session ? <Layout><Settings /></Layout> : <Navigate to="/auth" />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;