import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';



export async function GET(
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


    return NextResponse.json({ data: product }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json();

    const existingProduct = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: `Product with slug '${params.slug}' not found` },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { slug: params.slug },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        thumbnail: body.thumbnail,
        images: body.images,
        price: body.price,
        weight: body.weight,
        stock: body.stock,
        isActive: body.isActive,
        isFeatured: body.isFeatured
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update product with slug '${params.slug}'` },
      { status: 500 }
    );
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
