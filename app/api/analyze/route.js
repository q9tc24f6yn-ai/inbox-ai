import OpenAI from "openai";

export async function POST(req) {
  try {
    const { message, tone } = await req.json();

    // Vérifie la clé API
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        category: "ERROR",
        response: "Clé API manquante (.env.local)"
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Tu es un assistant de support client pour une boutique e-commerce.

Ton rôle est de gérer les messages clients de magasins en ligne.

Tu dois :
- analyser le message utilisateur
- le classer dans UNE seule catégorie :
  LIVRAISON, REMBOURSEMENT, PRODUIT, COMMANDE, AUTRE
- répondre de manière professionnelle, claire et rassurante
- proposer une solution concrète quand c'est possible
- rester concis (3 à 5 phrases max)

Règles importantes :
- Ne parle jamais de technique interne ou d'IA
- Ne sois jamais agressif ou vague
- Priorité : rassurer le client et résoudre le problème

Réponds UNIQUEMENT en JSON valide :

{
  "category": "LIVRAISON | REMBOURSEMENT | PRODUIT | COMMANDE | AUTRE",
  "response": "ta réponse ici"
}
          `
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = {
        category: "AUTRE",
        response: text
      };
    }

    return Response.json(parsed);

  } catch (error) {
    console.error("OPENAI ERROR:", error);

    return Response.json({
      category: "ERROR",
      response: "Erreur lors de l'appel à l'IA"
    });
  }
}