import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });
    }

    const apiKey = process.env.WATCHMODE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Watchmode API key not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.watchmode.com/v1/search/?apiKey=${apiKey}&search_value=${encodeURIComponent(query)}&search_field=name`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Watchmode API error" }, { status: response.status });
    }

    const data = await response.json();
    
    // Watchmode search returns { title_results: [...] }
    const results = (data.title_results || []).map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      imageUrl: item.image_url || "",
      year: item.year?.toString() || "",
      type: item.type || "",
      url: item.id.toString(), // Store ID as the relative URL for details
      provider: "Watchmode"
    }));

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalItems: results.length,
      },
    });
  } catch (error) {
    console.error("Watchmode Search Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
