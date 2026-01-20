import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    // 1. Vérification du mot de passe (Headers)
    const authHeader = request.headers.get('authorization');
    
    // On vérifie si le mot de passe correspond à celui dans .env.local
    if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // 2. On récupère les données envoyées (JSON)
    const body = await request.json();
    const { title, text, url } = body;

    // 3. On prépare le contenu (Texte + URL éventuelle)
    let finalContent = text || '';
    if (url) {
      finalContent = finalContent ? `${finalContent}\n\n${url}` : url;
    }

    // 4. On envoie tout ça dans la table 'items' de Supabase
    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          title: title || 'Note rapide', // Titre par défaut si vide
          content: finalContent,
          type: 'inbox',     // On classe dans "à trier" par défaut
          status: 'inbox'
        },
      ])
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Sauvegardé !' }, { status: 200 });

  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}