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
    const {
      name,
      slug,
      title,
      description,
      thumbnail,
      images = [],
      variants = [], 
      faqs = [],
      ingredients = [],
      categories = [],
      tags = [],
      frequentlyBoughtProducts = [],
      relatedProducts = [],
      isFeatured = false,
      isActive = true,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    if (!Array.isArray(images) || !Array.isArray(categories) || !Array.isArray(tags) ||
        !Array.isArray(frequentlyBoughtProducts) || !Array.isArray(relatedProducts)) {
      return NextResponse.json({ error: "Images, categories, tags, frequentlyBoughtProducts, and relatedProducts must be arrays" }, { status: 400 });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: "Variants must be an array with at least one variant" }, { status: 400 });
    }
    for (const variant of variants) {
      if (!variant.size || !variant.price || typeof variant.stock !== "number") {
        return NextResponse.json({ error: "Each variant must have size, price, and stock" }, { status: 400 });
      }
    }

    if (!Array.isArray(ingredients)) {
      return NextResponse.json({ error: "Ingredients must be an array" }, { status: 400 });
    }
    for (const ingredient of ingredients) {
      if (!ingredient.name || !ingredient.description) {
        return NextResponse.json({ error: "Each ingredient must have name and description" }, { status: 400 });
      }
    }

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "FAQs must be an array" }, { status: 400 });
    }
    for (const faq of faqs) {
      if (!faq.question || !faq.answer) {
        return NextResponse.json({ error: "Each FAQ must have question and answer" }, { status: 400 });
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        title,
        description,
        thumbnail,
        images,
        categories,
        tags,
        frequentlyBoughtProducts,
        relatedProducts,
        isFeatured,
        isActive,
        variants: {
          create: variants.map((variant: { size: string; price: number; stock: number; discount?: number }) => ({
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
            discount: variant.discount,
          })),
        },
        ingredients: {
          create: ingredients.map((ingredient: { name: string; description: string }) => ({
            name: ingredient.name,
            description: ingredient.description,
          })),
        },
        faqs: {
          create: faqs.map((faq: { question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        },
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error : any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product", details: error.message }, { status: 500 });
  }
}
