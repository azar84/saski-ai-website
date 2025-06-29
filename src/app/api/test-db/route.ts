import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as timestamp` as Array<{ timestamp: Date }>
    return NextResponse.json({ 
      success: true, 
      timestamp: result[0].timestamp,
      message: 'Database connection successful!'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: (error as Error).message },
      { status: 500 }
    )
  }
} 