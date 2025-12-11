import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Package } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    lowStock: 0,
    totalItems: 0,
    shoppingListCount: 0
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get Products
    const { data: products } = await supabase.from('products').select('*').eq('user_id', user.id);
    // Get Shopping List
    const { data: shopping } = await supabase.from('shopping_list').select('*').eq('user_id', user.id);

    if (products) {
        const low = products.filter(p => p.quantity <= p.min_threshold).length;
        setStats({
            lowStock: low,
            totalItems: products.length,
            shoppingListCount: shopping?.length || 0
        });

        // Group by category for chart
        const catMap: Record<string, number> = {};
        products.forEach(p => {
            catMap[p.category] = (catMap[p.category] || 0) + p.quantity;
        });
        
        const chartData = Object.keys(catMap).map(key => ({
            name: key,
            count: catMap[key]
        }));
        setCategoryData(chartData);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-givd-surface border-l-8 border-l-givd-blue">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-full text-givd-blue">
                    <Package size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Produits en Stock</p>
                    <h3 className="text-3xl font-display font-black text-white">{stats.totalItems}</h3>
                </div>
            </div>
        </Card>

        <Card className={`bg-givd-surface border-l-8 ${stats.lowStock > 0 ? 'border-l-givd-orange' : 'border-l-givd-green'}`}>
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${stats.lowStock > 0 ? 'bg-orange-900/30 text-givd-orange' : 'bg-green-900/30 text-givd-green'}`}>
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Alertes Stock Bas</p>
                    <h3 className="text-3xl font-display font-black text-white">{stats.lowStock}</h3>
                </div>
            </div>
        </Card>

        <Card className="bg-givd-surface border-l-8 border-l-white">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-700/30 rounded-full text-white">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-sm">À Acheter</p>
                    <h3 className="text-3xl font-display font-black text-white">{stats.shoppingListCount}</h3>
                </div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Répartition du Stock">
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                        <XAxis dataKey="name" stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                        <YAxis stroke="#666" tick={{fill: '#999'}} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1F1F1F', border: '2px solid #000'}}
                            itemStyle={{color: '#fff'}}
                        />
                        <Bar dataKey="count" fill="#3A7AFE">
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3A7AFE' : '#49D288'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card title="Dernières Activités">
            <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-300">Achat validé - Supermarché</span>
                        <span className="text-xs text-gray-500">Il y a {i + 1} jours</span>
                    </div>
                ))}
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                     <span className="text-gray-300">Scan OCR Ticket</span>
                     <span className="text-xs text-gray-500">Il y a 4 jours</span>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};