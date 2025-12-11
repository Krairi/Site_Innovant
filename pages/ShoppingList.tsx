import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Product, ShoppingItem, UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getSmartSuggestions } from '../services/geminiService';
import { Check, Plus, Trash, Sparkles, ShoppingBag } from 'lucide-react';

export const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [transportMode, setTransportMode] = useState('car');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load Items
    const { data: listData } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', user.id)
      .order('is_checked', { ascending: true });
    
    if (listData) setItems(listData);

    // Load transport mode for context
    const { data: profile } = await supabase
        .from('profiles')
        .select('transport_mode')
        .eq('id', user.id)
        .single();
    
    if (profile) setTransportMode(profile.transport_mode);
    setLoading(false);
  };

  const addItem = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name) return;

    const newItemObj = {
      user_id: user.id,
      name: name,
      quantity: 1,
      is_checked: false
    };

    const { data } = await supabase.from('shopping_list').insert([newItemObj]).select();
    if (data) setItems([...items, ...data]);
    setNewItem('');
  };

  const toggleCheck = async (id: string, current: boolean) => {
    await supabase.from('shopping_list').update({ is_checked: !current }).eq('id', id);
    setItems(items.map(i => i.id === id ? { ...i, is_checked: !current } : i));
  };

  const deleteItem = async (id: string) => {
    await supabase.from('shopping_list').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  const generateSmartSuggestions = async () => {
    setSuggesting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch current inventory to know what we have
    const { data: inventory } = await supabase
        .from('products')
        .select('name, quantity')
        .eq('user_id', user.id);
    
    const suggestions = await getSmartSuggestions(inventory || [], transportMode);
    
    // Auto-add suggestions to list (or show UI to approve - for now we add directly for speed)
    const newItems = suggestions.map(name => ({
        user_id: user.id,
        name,
        quantity: 1,
        is_checked: false
    }));

    if (newItems.length > 0) {
        const { data } = await supabase.from('shopping_list').insert(newItems).select();
        if (data) setItems([...items, ...data]);
    }
    setSuggesting(false);
  };

  const handleBuy = () => {
    alert("Redirection vers le partenaire (Mock: Amazon Fresh / Carrefour)");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold text-white">Liste de Courses</h2>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={generateSmartSuggestions} disabled={suggesting}>
                <Sparkles className="inline mr-2" size={18} />
                {suggesting ? 'IA Réfléchit...' : 'Auto-Génération'}
            </Button>
            <Button variant="primary" onClick={handleBuy}>
                <ShoppingBag className="inline mr-2" size={18} />
                Achat Direct
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 min-h-[400px]">
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(newItem)}
                    placeholder="Ajouter un article..."
                    className="flex-1 bg-[#1F1F1F] border-2 border-gray-600 p-2 text-white focus:border-givd-blue outline-none"
                />
                <Button onClick={() => addItem(newItem)}><Plus size={20}/></Button>
            </div>

            <div className="space-y-2">
                {items.length === 0 && <p className="text-gray-500 text-center mt-10">Liste vide.</p>}
                {items.map(item => (
                    <div key={item.id} className={`flex items-center justify-between p-3 border-2 transition-all ${item.is_checked ? 'border-gray-800 bg-gray-900 opacity-50' : 'border-black bg-givd-surface shadow-neo-sm'}`}>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCheck(item.id, item.is_checked)}>
                            <div className={`w-6 h-6 border-2 flex items-center justify-center ${item.is_checked ? 'bg-givd-green border-givd-green' : 'border-gray-500'}`}>
                                {item.is_checked && <Check size={16} className="text-black" />}
                            </div>
                            <span className={`font-medium ${item.is_checked ? 'line-through text-gray-500' : 'text-white'}`}>{item.name}</span>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-600 hover:text-red-500">
                            <Trash size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </Card>

        <Card title="Infos Transport">
            <div className="text-center space-y-4">
                <div className="text-6xl text-center">
                    {transportMode === 'car' ? '🚗' : transportMode === 'bike' ? '🚲' : '🚶'}
                </div>
                <p className="text-sm text-gray-400">
                    Mode actuel : <span className="text-white font-bold uppercase">{transportMode === 'car' ? 'Voiture' : transportMode === 'bike' ? 'Vélo' : 'À pied'}</span>
                </p>
                <div className="p-3 bg-[#1F1F1F] border border-gray-700 text-xs text-gray-400">
                    {transportMode === 'bike' && "⚠️ Attention au volume, vous êtes en vélo."}
                    {transportMode === 'walk' && "⚠️ Limitez le poids, vous êtes à pied."}
                    {transportMode === 'car' && "✅ Vous pouvez faire le gros plein."}
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};