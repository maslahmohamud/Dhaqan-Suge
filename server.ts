import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not defined.');
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

app.post('/api/scan', async (req, res) => {
  try {
    const { image, artifacts } = req.body;

    if (!image) return res.status(400).json({ error: 'No image data provided.' });
    if (!Array.isArray(artifacts)) return res.status(400).json({ error: 'Artifacts must be an array.' });

    let mimeType = 'image/jpeg';
    let base64Data = '';

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) { mimeType = match[1]; base64Data = match[2]; }
    } else if (image.startsWith('http')) {
      const imageRes = await fetch(image);
      const buf = await imageRes.arrayBuffer();
      mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
      base64Data = Buffer.from(buf).toString('base64');
    } else {
      return res.status(400).json({ error: 'Unsupported image format.' });
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          {
            text: `Analyze the user's image and compare against this Somali cultural artifacts database:
${JSON.stringify(artifacts, null, 2)}

Rules:
- If match >= 70%: return matched=true, artifactId=exact id, confidence=percentage
- If match < 70%: return matched=false, message="Ma aanaan helin shay dhaqan oo sawirkan la mid ah"
- Never guess below 70% threshold.

Return only valid JSON matching the schema.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matched:    { type: Type.BOOLEAN },
            artifactId: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            message:    { type: Type.STRING },
          },
          required: ['matched'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini.');
    return res.json(JSON.parse(text.trim()));

  } catch (err: any) {
    console.error('Scan error:', err.message);
    // Fallback
    return res.json({
      matched: false,
      message: 'Ma aanaan helin shay dhaqan oo sawirkan la mid ah',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();