import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  const file = await readFile(path.join(process.cwd(), 'public', 'cv-galang.pdf'));
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="CV_Galang_Arrauf_Pramudito.pdf"',
      'Content-Length': file.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
