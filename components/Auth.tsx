import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage('Lien magique envoyé ! Vérifiez vos emails.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F1F1F] p-4">
      <Card className="w-full max-w-md bg-givd-surface">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl text-givd-blue mb-2">GIVD.</h1>
          <p className="text-gray-400">Gestionnaire Intelligent de Vie Domestique</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-white">Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1F1F1F] border-2 border-gray-600 p-3 text-white focus:border-givd-blue focus:outline-none transition-colors"
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer Magic Link'}
          </Button>

          {message && (
            <div className={`p-3 border-2 text-sm font-bold ${message.includes('Erreur') ? 'border-givd-orange text-givd-orange' : 'border-givd-green text-givd-green'}`}>
              {message}
            </div>
          )}
        </form>
        
        <div className="mt-8 text-xs text-center text-gray-500">
          Powered by Supabase & Gemini AI
        </div>
      </Card>
    </div>
  );
};