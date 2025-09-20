// Using the Anthropic (Sonnet) library
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // This new block handles the browser's preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // The rest of your function logic
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'No prompt provided.' });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].text;
    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error calling Anthropic:', error.message);
    return res.status(500).json({ message: 'An error occurred while contacting the AI.' });
  }
}