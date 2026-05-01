import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    // Get the id from query parameters
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");

    // If ID is provided, fetch single card by ID
    if (cardId) {
      const card = await Card.findById(cardId)
        .populate("createdBy", "name email");

      if (!card) {
        return NextResponse.json(
          { message: "Card not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(card, { status: 200 });
    }

    // Otherwise, fetch all cards, sorted by newest first
    const cards = await Card.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error("Error fetching cards:", error);
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

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get card data from request body
    const { id, name, price, category, image, description } = await req.json();

    // Validate required fields
    if (!id || !name || !price || !category || !image) {
      return NextResponse.json(
        { message: "Missing required fields: id, name, price, category, image" },
        { status: 400 }
      );
    }

    // Find and update the card
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      {
        name,
        price: parseFloat(price),
        category,
        image,
        description: description || "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Card updated successfully", card: updatedCard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating card:", error);
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

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get card ID from query parameters
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("id");

    if (!cardId) {
      return NextResponse.json(
        { message: "Card ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the card
    const deletedCard = await Card.findByIdAndDelete(cardId);

    if (!deletedCard) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Card deleted successfully", card: deletedCard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
