import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@firmes/db";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não está configurada");
  return new Stripe(key, { apiVersion: "2023-10-16" as any });
}

function buildPlanConfig(): Record<string, { plan: string; maxChurches: number }> {
  const config: Record<string, { plan: string; maxChurches: number }> = {};
  const entries: [string | undefined, string, number][] = [
    [process.env.STRIPE_PRICE_PRATA,             "PRATA",             1],
    [process.env.STRIPE_PRICE_OURO,              "OURO",              1],
    [process.env.STRIPE_PRICE_DIAMANTE,          "DIAMANTE",          1],
    [process.env.STRIPE_PRICE_ESMERALDA_STARTER, "ESMERALDA_STARTER", 5],
    [process.env.STRIPE_PRICE_ESMERALDA_PRO,     "ESMERALDA_PRO",     15],
    [process.env.STRIPE_PRICE_ESMERALDA_PLUS,    "ESMERALDA_PLUS",    25],
    [process.env.STRIPE_PRICE_ESMERALDA_ULTRA,   "ESMERALDA_ULTRA",   999],
  ];
  for (const [priceId, plan, maxChurches] of entries) {
    if (priceId) config[priceId] = { plan, maxChurches };
  }
  return config;
}

async function logAudit(action: string, targetId: string, details: string) {
  try {
    await prisma.auditLog.create({ data: { action, targetId, details } });
  } catch (e) {
    console.error("[AuditLog]", e);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET não configurada");
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();
  const PLAN_CONFIG = buildPlanConfig();

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
          await logAudit("SUBSCRIPTION_CREATED", tenant.id, `Novo pagamento: ${PLAN_CONFIG[priceId].plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
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
          await logAudit("SUBSCRIPTION_UPDATED", tenant.id, `Status: ${status}`);
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
          await logAudit("SUBSCRIPTION_CANCELLED", tenant.id, "Cliente cancelou a assinatura");
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
            await logAudit("TENANT_SUSPENDED", tenant.id, `Pagamento falhou ${attemptCount}x — tenant suspenso`);
          } else {
            await logAudit("PAYMENT_FAILED", tenant.id, `Tentativa ${attemptCount} falhou`);
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
