import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/orders";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { 
      shippingName, 
      shippingAddress,
      shippingEmail,
      shippingPhone,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      products, 
      totalPrice,
      paymentMethod 
    } = body;

    if (!shippingName || !shippingAddress || !products || !totalPrice) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      shippingName,
      shippingAddress,
      shippingEmail,
      shippingPhone,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      products,
      totalPrice,
      paymentMethod: paymentMethod || 'COD'
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId: order._id,
      order
    }, { status: 201 });

  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Order Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete order', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { orderId, orderStatus } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { success: false, message: "Missing orderId or orderStatus" },
        { status: 400 }
      );
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Order Successful', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Order status updated successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Order Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order', error: error.message },
      { status: 500 }
    );
  }
}
