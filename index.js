const { VertexAI } = require('@google-cloud/aiplatform');

// Initialize Vertex AI with your project ID and location
const vertex_ai = new VertexAI({ project: 'artful-patrol-468204-u5', location: 'us-central1' });
const model = 'gemini-1.5-flash-001';

const generativeModel = vertex_ai.getGenerativeModel({ model: model });

exports.askAiConcierge = async (req, res) => {
  // Set CORS headers to allow your website to call this function
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).send('No prompt provided.');
  }

  try {
    const resp = await generativeModel.generateContent(prompt);
    const text = resp.response.candidates[0].content.parts[0].text;
    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.status(500).send('An error occurred while contacting the AI.');
  }
};