import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StaticEntityPage from "@/components/static-entity-page"
import { EntitySchema } from "@/components/schema-markup"
import type { Entity } from "@/lib/types/entity"

interface EntityPageProps {
  params: {
    slug: string
  }
}

async function getEntityData(slug: string) {
  try {
    const entity = await prisma.entity.findFirst({
      where: { slug },
      include: {
        entityLinks: true,
        entityAbout: true,
        balanceSheet: { orderBy: { date: 'desc' } },
        entityTimeSeries: { orderBy: { date: 'desc' } }
      }
    });

    if (!entity) return null;

    const similarEntities = await prisma.entity.findMany({
      where: {
        type: entity.type,
        slug: { not: slug }
      },
      orderBy: { updatedAt: 'desc' },
      take: 8
    });

    const serializeData = (data: any): any => {
      if (data === null || data === undefined) return data;
      if (data instanceof Date) return data.toISOString();
      if (typeof data === 'bigint') return data.toString();
      if (Array.isArray(data)) return data.map(item => serializeData(item));
      if (typeof data === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(data)) {
          serialized[key] = serializeData(value);
        }
        return serialized;
      }
      return data;
    };

    return {
      entity: serializeData(entity),
      similarEntities: similarEntities.map(serializeData)
    };
  } catch (error) {
    console.error('Error fetching entity data:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const entities = await prisma.entity.findMany({
      select: { slug: true }
    })
    
    return entities.map((entity) => ({
      slug: entity.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function EntityPage({ params }: EntityPageProps) {
  const data = await getEntityData(params.slug);
  // console.log("data", data?.entity.entityAbout);

  if (!data) {
    notFound();
  }

  return (
    <>
      <EntitySchema entity={data.entity} />
      <StaticEntityPage entity={data.entity} similarEntities={data.similarEntities} />
    </>
  );
}