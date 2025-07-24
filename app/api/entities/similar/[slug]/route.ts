import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const entity = await prisma.entity.findFirst({
    where: { slug: slug as string },
    select: { id: true, type: true },
  });

  if (!entity) {
    return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  }

  const similarEntities = await prisma.entity.findMany({
    where: {
      type: entity.type,
      slug: { not: slug },
    },
    orderBy: { updatedAt: 'desc' },
    take: 8,
  });

  const shuffled = similarEntities.sort(() => 0.5 - Math.random());
  const result = shuffled.slice(0, 8);

  return NextResponse.json(result);
} 