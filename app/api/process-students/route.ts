import { NextRequest, NextResponse } from 'next/server'

/**
 * Process Students API Route
 * 
 * This endpoint receives the pathname of an uploaded Excel file from Vercel Blob
 * and triggers the Python backend to:
 * 1. Read the file from Blob storage
 * 2. Parse and validate student data
 * 3. Upsert students to MongoDB
 * 
 * The request is sent to Python backend asynchronously (non-blocking).
 * The endpoint returns immediately while Python processes in the background.
 * 
 * Expected Request Body:
 * {
 *   pathname: string (path to file in Vercel Blob)
 *   filename: string (original filename)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pathname, filename } = body

    if (!pathname || !filename) {
      return NextResponse.json(
        { error: 'Missing pathname or filename' },
        { status: 400 }
      )
    }

    console.log('[v0] Processing file:', { pathname, filename })

    // Get Python backend URL
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL
    
    if (!pythonBackendUrl) {
      console.error('[v0] PYTHON_BACKEND_URL not configured')
      return NextResponse.json(
        {
          error: 'Backend processing not configured',
          message: 'Python backend URL is not set in environment variables',
        },
        { status: 500 }
      )
    }

    // Send request to Python backend asynchronously (fire-and-forget)
    // We don't await this - it runs in the background
    fetch(`${pythonBackendUrl}/process-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PYTHON_BACKEND_SECRET || ''}`,
      },
      body: JSON.stringify({
        blobPathname: pathname,
        filename: filename,
        blobToken: process.env.BLOB_READ_WRITE_TOKEN,
      }),
    }).catch((error) => {
      console.error('[v0] Background processing error:', error)
    })

    // Return immediately to frontend
    console.log('[v0] Processing triggered for:', filename)

    return NextResponse.json({
      success: true,
      message: 'Processing started in background',
      file: filename,
    })
  } catch (error) {
    console.error('[v0] Process students error:', error)
    return NextResponse.json(
      {
        error: 'Failed to start processing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
