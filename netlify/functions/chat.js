exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GEMINI_API_KEY is not configured in Netlify." })
      };
    }

    const { messages = [] } = JSON.parse(event.body || "{}");

    const contents = messages
      .filter(m => m && typeof m.text === "string")
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text.slice(0, 4000) }]
      }));

    if (!contents.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please enter a message." })
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are the property assistant for The Capital Real Estate. Be professional and helpful. Never invent property listings, prices, or availability."
            }]
          },
          contents
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Gemini service failed. Check API access, model availability, and quota."
        })
      };
    }

    const reply = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("") || "Sorry, no response was generated.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The assistant is temporarily unavailable." })
    };
  }
};
