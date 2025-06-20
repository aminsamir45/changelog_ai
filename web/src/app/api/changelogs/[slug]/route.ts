import { NextResponse } from 'next/server';
import { getChangelogBySlug } from '@/lib/changelog';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const changelog = await getChangelogBySlug(slug);
    
    if (!changelog) {
      return NextResponse.json(
        { error: 'Changelog not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(changelog);
  } catch (error) {
    console.error('Error fetching changelog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
} 