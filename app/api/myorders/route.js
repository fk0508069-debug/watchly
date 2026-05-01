import { connectDB } from "@/lib/db";
import Order from "@/models/orders";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    // Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Fetch all orders (admin can see all, users see their own)
    const query = {};
    if (decoded.role !== "admin") {
      // For non-admin users, you might want to filter by user ID if the Order model has a userId field
      // For now, we'll return all orders
    }

    const orders = await Order.find(query)
      .populate("products.productId", "name price image")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get order data from request body
    const { orderId, orderStatus } = await req.json();

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { message: "Missing required fields: orderId, orderStatus" },
        { status: 400 }
      );
    }

    // Validate orderStatus
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Order Successful', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true, runValidators: true }
    ).populate("products.productId", "name price image");

    if (!updatedOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Order status updated successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get order ID from query params
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { message: "Missing required field: orderId" },
        { status: 400 }
      );
    }

    // Find and delete the order
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
