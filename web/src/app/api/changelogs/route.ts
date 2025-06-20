import { NextResponse } from 'next/server';
import { getAllChangelogs } from '@/lib/changelog';

export async function GET() {
  try {
    const changelogs = await getAllChangelogs();
    return NextResponse.json(changelogs);
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500 }
    );
  }
} 