import { date, symbol, z } from "zod";

export const ProductSchema = z.object({
    slug: z.string().min(3, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }).regex(/^[a-z0-9-]+$/, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }),
    name: z.string().min(3, {
        message: 'Project name must be at least 3 characters.',
    }),
    title: z.string().min(3, {
        message: 'Title must be at least 3 characters.',
    }).optional().nullable(),
    description: z.string().min(15, {
        message: 'Description must be at least 15 characters.',
    }).max(5000).optional().nullable(),
    thumbnail: z.string().optional().nullable(),
    images: z.array(z.string()).optional().nullable(),
    variants: z.array(z.object({
        size: z.string().min(1, {
            message: 'Variant size is required.',
        }),
        price: z.number().min(1, {
            message: 'Variant price must be greater than 0.',
        }),
        stock: z.number().min(1, {
            message: "Variant stock must be greater than 0.",
        }),
        discount: z.number().min(1, {
            message: 'Variant discount must be greater than 0.',
        }).optional().nullable(),
    })).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    categories: z.array(z.string()).optional().nullable(),
    isActive: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
});
