// Vercel serverless function
export default function handler(req, res) {
  // Your Express app logic here
  res.status(200).json({ message: 'API endpoint' });
}