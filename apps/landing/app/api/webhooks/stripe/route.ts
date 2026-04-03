import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2023-10-16" as any });

const PLAN_CONFIG: Record<string, { plan: string; maxChurches: number }> = {
  "price_prata": { plan: "PRATA", maxChurches: 1 },
  "price_ouro": { plan: "OURO", maxChurches: 1 },
  "price_diamante": { plan: "DIAMANTE", maxChurches: 1 },
  "price_esmeralda_starter": { plan: "ESMERALDA_STARTER", maxChurches: 5 },
  "price_esmeralda_pro": { plan: "ESMERALDA_PRO", maxChurches: 15 },
  "price_esmeralda_plus": { plan: "ESMERALDA_PLUS", maxChurches: 25 },
  "price_esmeralda_ultra": { plan: "ESMERALDA_ULTRA", maxChurches: 999 },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const priceId = session.metadata?.priceId || "";
        
        // Find tenant by stripe customer id
        const tenant = await prisma.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        });
        
        if (tenant && PLAN_CONFIG[priceId]) {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              plan: PLAN_CONFIG[priceId].plan as any,
              maxChurches: PLAN_CONFIG[priceId].maxChurches,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              subscriptionStatus: "active",
              trialEndsAt: null,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        
        const tenant = await prisma.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        });
        
        if (tenant) {
          const status = subscription.status;
          const subPriceId = subscription.items.data[0]?.price.id;
          const planConfig = subPriceId ? PLAN_CONFIG[subPriceId] : null;
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              subscriptionStatus: status,
              isActive: status === "active" || status === "trialing",
              ...(planConfig && {
                plan: planConfig.plan as any,
                maxChurches: planConfig.maxChurches,
              }),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const tenant = await prisma.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        });
        
        if (tenant) {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              plan: "FREE",
              maxChurches: 1,
              subscriptionStatus: "canceled",
              stripeSubscriptionId: null,
              stripePriceId: null,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const tenant = await prisma.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        });
        
        if (tenant) {
          const attemptCount = invoice.attempt_count || 0;
          if (attemptCount >= 3) {
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: {
                subscriptionStatus: "past_due",
                isActive: false,
              },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
