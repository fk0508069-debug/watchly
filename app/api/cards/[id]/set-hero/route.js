import { connectToDatabase } from '@/lib/db';
import Card from '@/models/Card';
import { verifyToken } from '@/lib/auth';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectToDatabase();

    // Disable all other hero products
    await Card.updateMany(
      { _id: { $ne: id } },
      { isHeroProduct: false }
    );

    // Set this product as hero
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { isHeroProduct: true },
      { new: true }
    ).populate('creator', 'name email');

    if (!updatedCard) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(updatedCard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Set hero error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
