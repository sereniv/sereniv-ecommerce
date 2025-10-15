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
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: "Variants must be an array and always have at least one variant" }, { status: 400 });
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

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (images !== undefined) updateData.images = images;
    if (categories !== undefined) updateData.categories = categories;
    if (tags !== undefined) updateData.tags = tags;
    if (frequentlyBoughtProducts !== undefined) updateData.frequentlyBoughtProducts = frequentlyBoughtProducts;
    if (relatedProducts !== undefined) updateData.relatedProducts = relatedProducts;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (variants.length >= 0) {
      updateData.variants = {
        deleteMany: {},
        create: variants.map(variant => ({
          size: variant.size,
          price: variant.price,
          stock: variant.stock,
          discount: variant.discount,
        })),
      };
    }

    if (ingredients.length >= 0) {
      updateData.ingredients = {
        deleteMany: {},
        create: ingredients.map(ingredient => ({
          name: ingredient.name,
          description: ingredient.description,
        })),
      };
    }

    if (faqs.length >= 0) {
      updateData.faqs = {
        deleteMany: {},
        create: faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer,
        })),
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { slug: params.slug },
      data: updateData,
      include: {
        variants: true,
        ingredients: true,
        faqs: true,
      },
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
