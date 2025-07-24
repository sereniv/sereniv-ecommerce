import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redisHandler } from '@/lib/redis'
import { EntityType } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const useCache = searchParams.get('cache') !== 'false'
    
    // Check cache first
    if (useCache) {
      const cachedData = await redisHandler.get('entities-all-data')
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: JSON.parse(cachedData as string),
          source: 'cache'
        })
      }
    }

    // Fetch all entities at once with optimized query
    const [companies, custodians] = await Promise.all([
      // Companies: PUBLIC, PRIVATE, GOVERNMENT
      prisma.entity.findMany({
        where: {
          type: {
            in: [EntityType.PUBLIC, EntityType.PRIVATE, EntityType.GOVERNMENT]
          }
        },
        orderBy: {
          bitcoinHoldings: 'desc'
        },
        include: {
          entityAbout: true,
        },
        take: 500 // Limit to top 500 companies
      }),

      // Custodians: DEFI, EXCHANGE, ETF
      prisma.entity.findMany({
        where: {
          type: {
            in: [EntityType.DEFI, EntityType.EXCHANGE, EntityType.ETF]
          }
        },
        orderBy: {
          bitcoinHoldings: 'desc'
        },
        include: {
          entityAbout: true,
        },
        take: 500 // Limit to top 500 custodians
      })
    ])

    // Serialize data to handle BigInt and Date objects
    const serializeData = (data: any): any => {
      if (data === null || data === undefined) return data
      if (data instanceof Date) return data.toISOString()
      if (typeof data === 'bigint') return data.toString()
      if (Array.isArray(data)) return data.map(item => serializeData(item))
      if (typeof data === 'object') {
        const serialized: any = {}
        for (const [key, value] of Object.entries(data)) {
          serialized[key] = serializeData(value)
        }
        return serialized
      }
      return data
    }

    // Group companies by type
    const companiesByType = {
      all: companies,
      public: companies.filter(c => c.type === EntityType.PUBLIC),
      private: companies.filter(c => c.type === EntityType.PRIVATE),
      government: companies.filter(c => c.type === EntityType.GOVERNMENT)
    }

    // Group custodians by type
    const custodiansByType = {
      all: custodians,
      defi: custodians.filter(c => c.type === EntityType.DEFI),
      exchange: custodians.filter(c => c.type === EntityType.EXCHANGE),
      etf: custodians.filter(c => c.type === EntityType.ETF)
    }

    const responseData = {
      companies: serializeData(companiesByType),
      custodians: serializeData(custodiansByType),
      treemapData: serializeData([...companies, ...custodians]),
      lastUpdated: new Date().toISOString()
    }

    // Cache for 5 minutes
    if (useCache) {
      await redisHandler.set('entities-all-data', JSON.stringify(responseData), {
        expirationTime: 60 * 5
      })
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      source: 'database'
    })

  } catch (error) {
    console.error('Error fetching all entities:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 