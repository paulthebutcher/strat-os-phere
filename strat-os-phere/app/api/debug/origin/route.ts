import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getOrigin } from '@/lib/server/origin'

export const runtime = 'nodejs'

/**
 * Debug endpoint to inspect origin computation.
 * Returns request headers and computed origin.
 * No authentication required.
 */
export async function GET() {
  try {
    const headersList = await headers()
    const forwardedHost = headersList.get("x-forwarded-host")
    const forwardedProto = headersList.get("x-forwarded-proto")
    const host = headersList.get("host")
    
    const computedOrigin = await getOrigin()
    
    return NextResponse.json({
      computedOrigin,
      host,
      xForwardedHost: forwardedHost,
      xForwardedProto: forwardedProto,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
    })
  } catch (error) {
    try {
      const errorHeadersList = await headers()
      return NextResponse.json(
        {
          error: 'Failed to compute origin',
          message: error instanceof Error ? error.message : String(error),
          host: errorHeadersList.get("host"),
          xForwardedHost: errorHeadersList.get("x-forwarded-host"),
          xForwardedProto: errorHeadersList.get("x-forwarded-proto"),
          VERCEL_ENV: process.env.VERCEL_ENV,
          VERCEL: process.env.VERCEL,
          NODE_ENV: process.env.NODE_ENV,
        },
        { status: 500 }
      )
    } catch {
      return NextResponse.json(
        {
          error: 'Failed to compute origin',
          message: error instanceof Error ? error.message : String(error),
          VERCEL_ENV: process.env.VERCEL_ENV,
          VERCEL: process.env.VERCEL,
          NODE_ENV: process.env.NODE_ENV,
        },
        { status: 500 }
      )
    }
  }
}

