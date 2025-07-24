import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {

  
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
  }

  try {
    const entity = await prisma.entity.findFirst({
        where: { slug: slug },
        include: {
          entityLinks: true,
          entityAbout: true,
          balanceSheet: true,
        }
      });
    
    return NextResponse.json({
      success: true,
      data: entity
    });
  } catch (error) {
    console.error('Error in GET /api/entity:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
