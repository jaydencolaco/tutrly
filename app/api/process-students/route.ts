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

    // Call your Python backend
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL
    
    if (!pythonBackendUrl) {
      console.error('[v0] PYTHON_BACKEND_URL not configured')
      return NextResponse.json(
        {
          error: 'Backend processing not configured',
          message: 'Python backend URL is not set',
        },
        { status: 500 }
      )
    }

    // Send request to Python backend with the blob pathname
    const pythonResponse = await fetch(`${pythonBackendUrl}/process-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PYTHON_BACKEND_SECRET}`,
      },
      body: JSON.stringify({
        blobPathname: pathname,
        filename: filename,
        blobToken: process.env.BLOB_READ_WRITE_TOKEN,
      }),
      timeout: 120000, // 2 minute timeout for long-running Python script
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({}))
      console.error('[v0] Python backend error:', errorData)
      return NextResponse.json(
        {
          error: 'Student processing failed',
          details: errorData.error || pythonResponse.statusText,
        },
        { status: pythonResponse.status }
      )
    }

    const result = await pythonResponse.json()

    console.log('[v0] Processing completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Student data processing started',
      result: result,
    })
  } catch (error) {
    console.error('[v0] Process students error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process students',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
