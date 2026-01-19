import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat or lng parameter' },
        { status: 400 }
      );
    }

    // Use Nominatim (OpenStreetMap) for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=vi`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NextShopV2-App/1.0'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Nominatim API error' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reverse geocode API error:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode' },
      { status: 500 }
    );
  }
}
