import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://olcan-compass-api.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, serviceId } = body;

    if (!providerId || !serviceId) {
      return NextResponse.json(
        { error: "providerId and serviceId are required" },
        { status: 400 }
      );
    }

    // Forward the auth token from the client
    const cookieStore = await cookies();
    const token = cookieStore.get("olcan_access_token")?.value;

    // Proxy to the backend commerce checkout endpoint
    const backendRes = await fetch(`${API_BASE}/api/commerce/me/checkout-intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        handle: serviceId,
        origin: `marketplace/provider/${providerId}`,
      }),
    });

    if (!backendRes.ok) {
      const errorBody = await backendRes.text();
      console.error("[Checkout API] Backend error:", backendRes.status, errorBody);
      return NextResponse.json(
        { error: "Erro ao iniciar checkout. Tente novamente." },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json({ url: data.checkout_url }, { status: 200 });
  } catch (error) {
    console.error("[Checkout API] Error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
