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
      include: {
        variants: true,
        faqs: true,
        ingredients: true
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
