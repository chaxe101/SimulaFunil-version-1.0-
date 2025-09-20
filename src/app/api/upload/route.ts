// This file is no longer used for video uploads and can be repurposed or deleted.
// The new video upload logic is in /api/bunny-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    return NextResponse.json({ error: 'This endpoint is deprecated for video uploads.' }, { status: 410 });
}
