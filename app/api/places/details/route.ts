import { NextRequest, NextResponse } from "next/server";
import { RAPIDAPI_CONFIG } from "@/app/config/rapidapi";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeid");

    if (!placeId) {
        return NextResponse.json({ error: "Missing placeid" }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://${RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST}/maps/api/place/details/json?placeid=${placeId}&language=vi`,
            {
                headers: {
                    "x-rapidapi-host": RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST,
                    "x-rapidapi-key": RAPIDAPI_CONFIG.GOOGLE_PLACES.API_KEY,
                },
            }
        );

        if (!response.ok) {
            console.error(`[Place Details Proxy] RapidAPI Error: ${response.status}`, {
                requestsLeft: response.headers.get("x-ratelimit-requests-remaining"),
                limit: response.headers.get("x-ratelimit-requests-limit")
            });
            return NextResponse.json(
                { error: "Failed to fetch from RapidAPI" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Place Details Proxy] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
