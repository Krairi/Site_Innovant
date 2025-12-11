# GIVD - Gestionnaire Intelligent de Vie Domestique

## Installation Locale

1.  Assurez-vous d'avoir Node.js installé.
2.  Dans le dossier du projet, lancez :
    ```bash
    npm install react react-dom react-router-dom @supabase/supabase-js @google/genai lucide-react recharts
    npm install -D tailwindcss postcss autoprefixer typescript @types/react @types/react-dom
    ```
3.  Pour lancer l'application (si vous utilisez Vite ou Create React App) :
    ```bash
    npm start
    # ou
    npm run dev
    ```

## Configuration Supabase

L'application est pré-configurée avec l'URL et la Clé fournies. Cependant, pour qu'elle soit fonctionnelle, vous devez initialiser la base de données :

1.  Allez dans votre dashboard Supabase > SQL Editor.
2.  Copiez le contenu du fichier `db_schema.sql`.
3.  Exécutez le script.

Cela créera les tables `products`, `shopping_list` et `profiles`, ainsi que les politiques de sécurité (RLS).

## Déploiement Vercel

1.  Installez Vercel CLI ou allez sur vercel.com.
2.  Importez ce projet.
3.  Ajoutez la variable d'environnement pour l'IA (si vous utilisez la fonctionnalité OCR/Suggestions) :
    *   `API_KEY`: Votre clé Google Gemini API.
4.  Déployez.

## Fonctionnalités IA

Pour que l'OCR (ticket de caisse) et les suggestions intelligentes fonctionnent, vous devez fournir une clé API Gemini valide dans les variables d'environnement ou le code (`services/geminiService.ts`).