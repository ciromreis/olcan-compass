import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { providerId, serviceId, amount } = await request.json();

    // Na infraestrutura final, aqui nós importamos:
    // import Stripe from "stripe";
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // e geramos o stripe.checkout.sessions.create()
    
    // Para V2.5 Mock / Dev Mode, nós retornamos uma deep link de sucesso:
    const mockSuccessUrl = `/marketplace/provider/${providerId}/success?session_id=mock_session_123&service=${serviceId}`;

    // Simular delay do Gateway
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({ url: mockSuccessUrl }, { status: 200 });
  } catch (error) {
    console.error("[Stripe Connect API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Checkout Mock" },
      { status: 500 }
    );
  }
}
