import { NextRequest, NextResponse } from "next/server";
import { RAPIDAPI_CONFIG } from "@/app/config/rapidapi";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input");

    if (!input) {
        return NextResponse.json({ predictions: [] });
    }

    try {
        const response = await fetch(
            `https://${RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST}/maps/api/place/queryautocomplete/json?input=${encodeURIComponent(
                input
            )}&language=vi&components=country:vn&location=21.028511,105.804817&radius=10000`,
            {
                headers: {
                    "x-rapidapi-host": RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST,
                    "x-rapidapi-key": RAPIDAPI_CONFIG.GOOGLE_PLACES.API_KEY,
                },
            }
        );

        if (!response.ok) {
            console.error(`[Autocomplete Proxy] RapidAPI Error: ${response.status}`, {
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
        console.error("[Autocomplete Proxy] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
