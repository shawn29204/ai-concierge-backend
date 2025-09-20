// File: /api/askAI.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getAIResponse(prompt) {
  const msg = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return { text: msg.content[0].text };
}

async function getMapResponse(query) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placesApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  
  const placesResponse = await fetch(placesApiUrl);
  if (!placesResponse.ok) throw new Error('Failed to fetch from Google Maps Places API.');
  
  const placesData = await placesResponse.json();
  if (placesData.status !== 'OK' || !placesData.results || placesData.results.length === 0) {
    throw new Error('No places found.');
  }

  const place = placesData.results[0];
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${place.geometry.location.lat},${place.geometry.location.lng}&key=${apiKey}`;
  
  return {
    name: place.name,
    address: place.formatted_address,
    streetViewUrl: streetViewUrl,
  };
}

export default async function handler(req, res) {
  // Handle CORS Preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for the main request
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed.' });
  }

  const { prompt, isMapQuery } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'No prompt provided.' });
  }

  try {
    const responseData = isMapQuery 
      ? await getMapResponse(prompt)
      : await getAIResponse(prompt);
      
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ message: 'An error occurred while contacting the API.' });
  }
}