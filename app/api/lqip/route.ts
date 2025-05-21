import { analyzeImage } from '@/lib/lqip';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN;

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const isAllowedOrigin =
      origin === ALLOWED_ORIGIN ||
      (origin && origin.startsWith('http://localhost'));

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
