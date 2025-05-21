import { analyzeImage } from '@/lib/lqip';
import { NextRequest, NextResponse } from 'next/server';

function getServerOrigin(request: NextRequest): string | null {
  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return host ? `${proto}://${host}` : null;
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const serverOrigin = getServerOrigin(request);

    const isAllowedOrigin = origin === serverOrigin || (origin && origin.startsWith('http://localhost'));

    if (!isAllowedOrigin) {
      return NextResponse.json({ error: 'Forbidden: Cross-origin request not allowed' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds 5MB' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await analyzeImage(buffer);

    return NextResponse.json({
      lqip: result.opaque && 'lqip' in result ? result.lqip : null,
      width: result.width,
      height: result.height,
      opaque: result.opaque,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
