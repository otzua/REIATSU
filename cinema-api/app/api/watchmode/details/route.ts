import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id") || searchParams.get("url"); // Accept id or url param
    const apiKey = process.env.WATCHMODE_API_KEY;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID parameter required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Watchmode API key not configured" }, { status: 500 });
    }

    // Fetch details with sources appended
    const response = await fetch(
      `https://api.watchmode.com/v1/title/${id}/details/?apiKey=${apiKey}&append_to_response=sources`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Watchmode API error" }, { status: response.status });
    }

    const data = await response.json();
    
    // Normalize to Reiatsu's CinemaMovieDetail format
    const normalized = {
      title: data.title,
      imageUrl: data.poster || data.image_url,
      description: data.plot_overview,
      year: data.year,
      rating: data.user_rating,
      genres: data.genre_names || [],
      watchOnline: data.sources && data.sources.length > 0 ? { url: data.sources[0].web_url } : undefined,
      downloadLinks: (data.sources || []).map((source: any) => ({
        quality: source.format || "HD",
        url: source.web_url,
        type: source.type,
        audio: source.name // Use service name as audio/label
      })),
      episodes: []
    };

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error("Watchmode Details Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
