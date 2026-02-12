import Stripe from 'https://esm.sh/stripe@14'
import { serve } from 'https://deno.land/std/http/server.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { amount, currency = 'usd', metadata } = await req.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  })

  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  )
})
