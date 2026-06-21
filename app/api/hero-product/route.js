import { connectToDatabase } from '@/lib/db';
import Card from '@/models/Card';

export async function GET(req) {
  try {
    await connectToDatabase();

    // Find the product marked as hero
    const heroProduct = await Card.findOne({ isHeroProduct: true })
      .populate('creator', 'name email')
      .lean();

    if (!heroProduct) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(heroProduct), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Hero product fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
