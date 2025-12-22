import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSharedProjectByToken } from '@/lib/shares'

export const runtime = 'edge'

const WIDTH = 1200
const HEIGHT = 630

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<ImageResponse> {
  const { token } = await params

  // Get shared project data (no auth required)
  const supabase = await createClient()
  const sharedData = await getSharedProjectByToken(supabase, token)

  if (!sharedData) {
    notFound()
  }

  const projectName = sharedData.project.name
  const competitorCount = sharedData.competitorCount
  const generatedAt = sharedData.generatedAt
    ? new Date(sharedData.generatedAt)
    : null

  // Format date
  let dateText = ''
  if (generatedAt) {
    dateText = `Generated ${generatedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`
  }

  // Calculate evidence window
  let evidenceWindowText = ''
  if (generatedAt) {
    const now = new Date()
    const diffMs = now.getTime() - generatedAt.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days <= 7) {
      evidenceWindowText = `${days} day${days !== 1 ? 's' : ''}`
    } else if (days <= 30) {
      const weeks = Math.floor(days / 7)
      evidenceWindowText = `${weeks} week${weeks !== 1 ? 's' : ''}`
    } else {
      const months = Math.floor(days / 30)
      evidenceWindowText = `${months} month${months !== 1 ? 's' : ''}`
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            padding: '80px',
            zIndex: 1,
          }}
        >
          {/* Plinth wordmark */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-1px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Plinth
          </div>

          {/* Project name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 600,
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.2,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {projectName}
          </div>

          {/* Top opportunities badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 500,
              color: '#ffffff',
              letterSpacing: '0.5px',
            }}
          >
            Top opportunities
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '48px',
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div>
              {competitorCount} competitor{competitorCount !== 1 ? 's' : ''}
            </div>
            {evidenceWindowText && (
              <div>Evidence: {evidenceWindowText}</div>
            )}
          </div>

          {/* Date */}
          {dateText && (
            <div
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                marginTop: '8px',
              }}
            >
              {dateText}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  )
}

