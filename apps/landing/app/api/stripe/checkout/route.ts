import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2023-10-16" as any });

const PRICE_IDS: Record<string, string> = {
  PRATA: process.env.STRIPE_PRICE_PRATA || "price_prata",
  OURO: process.env.STRIPE_PRICE_OURO || "price_ouro",
  DIAMANTE: process.env.STRIPE_PRICE_DIAMANTE || "price_diamante",
  ESMERALDA_STARTER: process.env.STRIPE_PRICE_ESMERALDA_STARTER || "price_esmeralda_starter",
  ESMERALDA_PRO: process.env.STRIPE_PRICE_ESMERALDA_PRO || "price_esmeralda_pro",
  ESMERALDA_PLUS: process.env.STRIPE_PRICE_ESMERALDA_PLUS || "price_esmeralda_plus",
  ESMERALDA_ULTRA: process.env.STRIPE_PRICE_ESMERALDA_ULTRA || "price_esmeralda_ultra",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, tenantId, successUrl, cancelUrl } = body;

    if (!plan || !tenantId) {
      return NextResponse.json({ error: "Plan e tenantId obrigatorios" }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Plano invalido" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ 
      where: { id: tenantId },
      include: { users: { take: 1 } },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.users[0]?.email || undefined,
        metadata: { tenantId: tenant.id },
      });
      customerId = customer.id;
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      metadata: {
        tenantId,
        priceId,
      },
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/white-label/planos?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/white-label/planos?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[POST /api/stripe/checkout]", error);
    return NextResponse.json({ error: "Erro ao criar sessao" }, { status: 500 });
  }
}
