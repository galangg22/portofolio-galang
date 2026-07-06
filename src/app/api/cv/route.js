import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'cv-galang.pdf')
    const file = await readFile(filePath)
    
    return new Response(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="CV_Galang_Arrauf_Pramudito.pdf"',
        'Content-Length': file.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('CV file read error:', error)
    
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { 
          error: 'CV file not found',
          details: 'Please ensure cv-galang.pdf exists in the public directory'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to read CV file',
        details: error.message
      },
      { status: 500 }
    )
  }
}
