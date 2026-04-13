import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ✅ Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // ✅ ALWAYS UPLOAD FIRST
    const blob = await put(file.name, file, {
      access: 'private',
      addRandomSuffix: true,
    })

    // 🔥 TRY BACKEND (BUT DON'T BREAK IF IT FAILS)
    try {
      await fetch('https://backend-production-4e41.up.railway.app/process-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization':
            'Bearer e3f9a7c1d5b8e4f2a6c9d7b1e5f3a8c2d4b6e9f1a7c3d5b8e2f6a9c1d7b3e5f8',
        },
        body: JSON.stringify({
          blobPathname: blob.pathname,
          filename: file.name,
          blobToken: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      })
    } catch (backendError) {
      console.warn('⚠️ Backend processing failed, but upload succeeded:', backendError)
    }

    // ✅ ALWAYS RETURN SUCCESS
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      pathname: blob.pathname,
      filename: file.name,
    })

  } catch (error) {
    console.error('Upload error:', error)

    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}