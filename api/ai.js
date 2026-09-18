export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel." });
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "Escribe un mensaje." });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: "Mensaje demasiado largo." });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input: text,
          system_instruction: "Eres la pequeña IA integrada en SoyPerritoProProYT-Console. Responde en español, de forma clara, breve y amigable. No digas que eres la web de Gemini ni redirijas al usuario a otras aplicaciones."
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini no pudo responder."
      });
    }

    const answer =
      data?.output_text ||
      data?.outputs?.find?.(x => x?.type === "text")?.text ||
      "🤖 No recibí una respuesta.";

    return res.status(200).json({ result: answer });
  } catch (error) {
    return res.status(500).json({ error: "Error al conectar con Gemini." });
  }
}