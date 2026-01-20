"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Charger les données au démarrage
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false }); // Les plus récents en haut
    
    if (error) console.log('Erreur de chargement:', error);
    else setItems(data || []);
    setLoading(false);
  }

  // 2. Ajouter un nouvel élément
  async function addItem(type: 'todo' | 'note') {
    if (!newItem.trim()) return;

    const { error } = await supabase
      .from('items')
      .insert([{ 
        title: newItem, 
        type: type, 
        status: 'inbox' 
      }]);

    if (error) {
      alert('Erreur lors de la sauvegarde');
    } else {
      setNewItem(''); // Vider le champ
      fetchItems();   // Recharger la liste
    }
  }

  // 3. Marquer comme fait / Archiver
  async function archiveItem(id: number) {
    await supabase
      .from('items')
      .update({ status: 'archived' })
      .eq('id', id);
    fetchItems();
  }

  // Filtres pour l'affichage
  const todos = items.filter(i => i.type === 'todo' && i.status !== 'archived');
  const notes = items.filter(i => (i.type === 'note' || i.type === 'idea') && i.status !== 'archived');

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête + Zone de saisie */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Mon Second Cerveau
          </h1>
          
          <div className="flex gap-2 justify-center max-w-xl mx-auto">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('todo')}
              placeholder="Qu'as-tu en tête ?"
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-lg"
            />
          </div>
          <div className="flex gap-4 justify-center mt-3">
            <button 
              onClick={() => addItem('todo')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition"
            >
              + Tâche (Action)
            </button>
            <button 
              onClick={() => addItem('note')}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition"
            >
              + Idée (Réflexion)
            </button>
          </div>
        </div>

        {/* Colonnes d'affichage */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Colonne ACTION */}
          <section className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
              ⚡ Actions ({todos.length})
            </h2>
            <div className="space-y-3">
              {loading ? <p className="text-gray-500">Chargement...</p> : null}
              {todos.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg group hover:bg-gray-750 transition">
                  <button 
                    onClick={() => archiveItem(item.id)}
                    className="mt-1 w-5 h-5 border-2 border-gray-500 rounded-full hover:bg-blue-500 hover:border-blue-500 transition"
                  ></button>
                  <p>{item.title}</p>
                </div>
              ))}
              {!loading && todos.length === 0 && <p className="text-gray-500 text-sm italic">Rien à faire... profite !</p>}
            </div>
          </section>

          {/* Colonne RÉFLEXION */}
          <section className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              🌱 Jardin de Pensées ({notes.length})
            </h2>
            <div className="space-y-4">
              {notes.map((item) => (
                <div key={item.id} className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                  <p className="font-medium text-lg mb-1">{item.title}</p>
                  {item.content && <p className="text-gray-400 text-sm whitespace-pre-wrap">{item.content}</p>}
                  <button 
                    onClick={() => archiveItem(item.id)}
                    className="text-xs text-gray-600 hover:text-red-400 mt-2"
                  >
                    Archiver
                  </button>
                </div>
              ))}
               {!loading && notes.length === 0 && <p className="text-gray-500 text-sm italic">Le jardin est vide.</p>}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}