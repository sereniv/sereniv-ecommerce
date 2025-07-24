import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EntityType } from '@prisma/client';
import { redisHandler } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || "all";

        let entities;

        const cache = await redisHandler.get(`admin-entities_${type}`);

        if (cache) {
          return NextResponse.json({ data: JSON.parse(cache as string), success: true });
        }
        if (type && type !== "all") {
            entities = await prisma.entity.findMany({
                where: {
                    type: type.toUpperCase() as EntityType
                },
                orderBy: {
                    bitcoinHoldings: 'desc'
                },
                select: {
                    name: true,
                    ticker: true,
                    countryName: true,
                    countryFlag: true,
                    type: true,
                    bitcoinHoldings: true,
                    marketCap: true,
                    enterpriseValue: true,
                    costBasis: true,
                    usdValue: true,
                    ngu: true,
                    mNav: true,
                    sharePrice: true,
                    marketCapPercentage: true,
                    supplyPercentage: true,
                    profitLossPercentage: true,
                    holdingSince: true,
                    avgCostPerBTC: true,
                    bitcoinValueInUSD: true,
                    rank: true,
                    slug : true,
                    createdAt: true,
                    updatedAt: true,
                }

            });
        } else {
            entities = await prisma.entity.findMany({
                orderBy: {
                    bitcoinHoldings: 'desc'
                },
                select: {
                    name: true,
                    ticker: true,
                    countryName: true,
                    countryFlag: true,
                    type: true,
                    bitcoinHoldings: true,
                    marketCap: true,
                    enterpriseValue: true,
                    costBasis: true,
                    usdValue: true,
                    ngu: true,
                    mNav: true,
                    sharePrice: true,
                    marketCapPercentage: true,
                    supplyPercentage: true,
                    profitLossPercentage: true,
                    holdingSince: true,
                    avgCostPerBTC: true,
                    bitcoinValueInUSD: true,
                    rank: true,
                    slug : true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
        }

        await redisHandler.set(`admin-entities_${type}`, JSON.stringify(entities), {
            expirationTime: 60 * 60 * 24 * 7, 
        });


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
