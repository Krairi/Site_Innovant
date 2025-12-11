import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { parseReceiptImage } from '../services/geminiService';
import { Plus, Trash2, Camera, AlertTriangle, Search } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple Add Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    await supabase.from('products').update({ quantity: newQty }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, quantity: newQty } : p));
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newItemName) return;

    const newProduct = {
      user_id: user.id,
      name: newItemName,
      quantity: newItemQty,
      category: 'Divers',
      min_threshold: 2
    };

    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (data) {
      setProducts([...products, ...data]);
      setNewItemName('');
      setNewItemQty(1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      
      const extractedItems = await parseReceiptImage(base64Data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user && extractedItems.length > 0) {
        const itemsToInsert = extractedItems.map(item => ({
          user_id: user.id,
          name: item.name,
          quantity: item.quantity || 1,
          category: item.category || 'Divers',
          expiry_date: item.expiry_date,
          min_threshold: 2
        }));

        const { data } = await supabase.from('products').insert(itemsToInsert).select();
        if (data) {
            setProducts(prev => [...prev, ...data]);
        }
      }
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-display font-bold text-white">Mon Stock</h2>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                {analyzing ? 'Analyse IA...' : <><Camera className="inline mr-2" size={18}/>Scan Ticket (IA)</>}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <Card title="Ajout Rapide" className="h-fit">
          <form onSubmit={handleManualAdd} className="space-y-4">
            <input
              type="text"
              placeholder="Nom du produit"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="w-full bg-[#1F1F1F] border-2 border-gray-600 p-2 text-white focus:border-givd-blue outline-none"
            />
            <div className="flex gap-2">
                <input
                type="number"
                value={newItemQty}
                onChange={e => setNewItemQty(parseInt(e.target.value))}
                className="w-20 bg-[#1F1F1F] border-2 border-gray-600 p-2 text-white focus:border-givd-blue outline-none"
                />
                <Button type="submit" fullWidth>Ajouter</Button>
            </div>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
            {loading ? (
                <p className="text-gray-500">Chargement...</p>
            ) : products.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-700 text-gray-500">
                    Stock vide. Scannez un ticket ou ajoutez manuellement.
                </div>
            ) : (
                products.map((product) => (
                    <div key={product.id} className="bg-givd-surface p-4 border-2 border-black shadow-neo-sm flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-lg text-white">{product.name}</h4>
                                {product.quantity <= product.min_threshold && (
                                    <span className="bg-givd-orange text-black text-xs px-2 py-0.5 font-bold">Critique</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{product.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-gray-700 bg-[#1F1F1F]">
                                <button onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)} className="px-3 py-1 hover:bg-gray-700 text-white">-</button>
                                <span className="px-3 text-white font-mono">{product.quantity}</span>
                                <button onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)} className="px-3 py-1 hover:bg-gray-700 text-white">+</button>
                            </div>
                            <button onClick={() => handleDelete(product.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};