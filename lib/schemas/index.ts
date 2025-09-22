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
    description: z.string().min(15, {
        message: 'Description must be at least 15 characters.',
    }).max(5000).optional().nullable(),
    thumbnail: z.string().optional().nullable(),
    images: z.array(z.string()).optional().nullable(),
    price: z.number().min(1, {
        message: 'Price must be at least 1.',
    })
        .max(1000000, {
            message: 'Price must be less than 1,000,000.',
        }),
    weight: z.string().optional().nullable(),
    stock: z.number().min(1, {
        message: 'Stock must be at least 1.',
    })
        .max(1000000, {
            message: 'Stock must be less than 1,000,000.',
        }),
    isActive: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
});
