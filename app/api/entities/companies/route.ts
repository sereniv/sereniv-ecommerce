import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EntityType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let entities;

    if (type && type !== "all") {
      entities = await prisma.entity.findMany({
        where: {
          type: type.toUpperCase() as EntityType
        },
        orderBy: {
          bitcoinHoldings: 'desc'
        },
        include: {
          entityAbout: true,
        }
      });
    } else {
      entities = await prisma.entity.findMany({
        orderBy: {
          bitcoinHoldings: 'desc'
        },
        where: {
          type: {
            in: [EntityType.PUBLIC, EntityType.PRIVATE, EntityType.GOVERNMENT]
          }
        },
        include: {
          entityAbout: true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: entities,
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
