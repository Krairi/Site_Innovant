import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TRANSPORT_MODES } from '../constants';
import { Car, Bike, Footprints } from 'lucide-react';

export const Settings: React.FC = () => {
  const [mode, setMode] = useState('car');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('transport_mode')
      .eq('id', user.id)
      .single();
    
    if (data) setMode(data.transport_mode);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // Upsert profile
        await supabase.from('profiles').upsert({
            id: user.id,
            transport_mode: mode
        });
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-display font-bold text-white">Préférences</h2>
      
      <Card title="Mode de Transport Habituel">
        <p className="mb-6 text-gray-400">
            Ce réglage influence les suggestions d'achats et le calcul des quantités recommandées.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {TRANSPORT_MODES.map((m) => {
                const Icon = m.value === 'car' ? Car : m.value === 'bike' ? Bike : Footprints;
                const isSelected = mode === m.value;
                
                return (
                    <button
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        className={`flex flex-col items-center justify-center p-6 border-2 transition-all gap-3
                        ${isSelected 
                            ? 'bg-givd-blue border-black text-white shadow-neo' 
                            : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'}`}
                    >
                        <Icon size={32} />
                        <span className="font-bold">{m.label}</span>
                    </button>
                );
            })}
        </div>

        <Button onClick={handleSave} fullWidth disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Enregistrer les préférences'}
        </Button>
      </Card>
    </div>
  );
};