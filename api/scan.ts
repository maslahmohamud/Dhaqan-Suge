import { GoogleGenAI, Type } from '@google/genai';

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

export default async function handler(req: any, res: any) {
  // CORS configuration for flexibility across domains/environments
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, artifacts } = req.body;

    if (!image) return res.status(400).json({ error: 'No image data provided.' });
    if (!Array.isArray(artifacts)) return res.status(400).json({ error: 'Artifacts must be an array.' });

    let mimeType = 'image/jpeg';
    let base64Data = '';

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
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
    return res.status(200).json(JSON.parse(text.trim()));

  } catch (err: any) {
    console.error('Scan error:', err.message);
    return res.status(200).json({
      matched: false,
      message: 'Ma aanaan helin shay dhaqan oo sawirkan la mid ah',
    });
  }
}
