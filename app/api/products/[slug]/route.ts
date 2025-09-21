import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {

  console.log
  try {
    const body = await req.json();
    const updatedProduct = await prisma.product.update({
      where: { slug: params.slug },
      data: body,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({ message: "Product already inactive" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { slug: params.slug },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Product marked as inactive", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
