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
    const {
      name,
      slug,
      title,
      description,
      thumbnail,
      images = [],
      variants = [],
      ingredients = [],
      faqs = [],
      categories = [],
      tags = [],
      frequentlyBoughtProducts = [],
      relatedProducts = [],
      isFeatured,
      isActive,
    } = body;

    // Manual validation
    if (name && typeof name !== "string") {
      return NextResponse.json({ error: "Name must be a string" }, { status: 400 });
    }
    if (slug && typeof slug !== "string") {
      return NextResponse.json({ error: "Slug must be a string" }, { status: 400 });
    }
    if (title && typeof title !== "string") {
      return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
    }
    if (description && typeof description !== "string") {
      return NextResponse.json({ error: "Description must be a string" }, { status: 400 });
    }
    if (thumbnail && typeof thumbnail !== "string") {
      return NextResponse.json({ error: "Thumbnail must be a string" }, { status: 400 });
    }
    if (!Array.isArray(images) || !Array.isArray(categories) || !Array.isArray(tags) ||
        !Array.isArray(frequentlyBoughtProducts) || !Array.isArray(relatedProducts)) {
      return NextResponse.json(
        { error: "Images, categories, tags, frequentlyBoughtProducts, and relatedProducts must be arrays" },
        { status: 400 }
      );
    }
    if (isFeatured !== undefined && typeof isFeatured !== "boolean") {
      return NextResponse.json({ error: "isFeatured must be a boolean" }, { status: 400 });
    }
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    // Validate variants
    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: "Variants must be an array" }, { status: 400 });
    }
    for (const variant of variants) {
      if ((variant.id && typeof variant.id !== "string") || !variant.size || typeof variant.price !== "number" || typeof variant.stock !== "number") {
        return NextResponse.json(
          { error: "Each variant must have size, price, and stock (and optional id as string)" },
          { status: 400 }
        );
      }
    }

    // Validate ingredients
    if (!Array.isArray(ingredients)) {
      return NextResponse.json({ error: "Ingredients must be an array" }, { status: 400 });
    }
    for (const ingredient of ingredients) {
      if ((ingredient.id && typeof ingredient.id !== "string") || !ingredient.name || !ingredient.description) {
        return NextResponse.json(
          { error: "Each ingredient must have name and description (and optional id as string)" },
          { status: 400 }
        );
      }
    }

    // Validate FAQs
    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "FAQs must be an array" }, { status: 400 });
    }
    for (const faq of faqs) {
      if ((faq.id && typeof faq.id !== "string") || !faq.question || !faq.answer) {
        return NextResponse.json(
          { error: "Each FAQ must have question and answer (and optional id as string)" },
          { status: 400 }
        );
      }
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: `Product with slug '${params.slug}' not found` },
        { status: 404 }
      );
    }

    // Check for slug uniqueness if changed
    if (slug && slug !== params.slug) {
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const updateData: any = {
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
    };

    if (variants.length > 0) {
      updateData.variants = {
        deleteMany: { id: { notIn: variants.filter(v => v.id).map(v => v.id) } },
        upsert: variants.map(variant => ({
          where: { id: variant.id || "" },
          update: {
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
            discount: variant.discount,
          },
          create: {
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
            discount: variant.discount,
          },
        })),
      };
    }

    // Handle ingredients: Update existing, create new, delete missing
    if (ingredients.length > 0) {
      updateData.ingredients = {
        deleteMany: { id: { notIn: ingredients.filter(i => i.id).map(i => i.id) } },
        upsert: ingredients.map(ingredient => ({
          where: { id: ingredient.id || "" },
          update: {
            name: ingredient.name,
            description: ingredient.description,
          },
          create: {
            name: ingredient.name,
            description: ingredient.description,
          },
        })),
      };
    }

    // Handle FAQs: Update existing, create new, delete missing
    if (faqs.length > 0) {
      updateData.faqs = {
        deleteMany: { id: { notIn: faqs.filter(f => f.id).map(f => f.id) } },
        upsert: faqs.map(faq => ({
          where: { id: faq.id || "" },
          update: {
            question: faq.question,
            answer: faq.answer,
          },
          create: {
            question: faq.question,
            answer: faq.answer,
          },
        })),
      };
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating product with slug '${params.slug}':`, error);
    return NextResponse.json(
      { error: `Failed to update product with slug '${params.slug}'`, details: error.message },
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
