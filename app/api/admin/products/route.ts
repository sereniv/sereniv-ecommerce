import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search')?.trim();

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(searchQuery && {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, thumbnail, images, price, stock, weight , isFeatured = false} = body;

    if (!name || !slug || !price || !stock || !thumbnail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        thumbnail,
        images,
        price,
        weight,
        stock,
        isFeatured
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
