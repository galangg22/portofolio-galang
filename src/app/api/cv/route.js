import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Baca file PDF dari folder /public
    const cvFilePath = path.join(process.cwd(), 'public', 'cv-galang.pdf');
    const fileBuffer = readFileSync(cvFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="CV_Galang_Arrauf_Pramudito.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    // Fallback: redirect ke file publik langsung
    return NextResponse.redirect(new URL('/cv-galang.pdf', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  }
}
