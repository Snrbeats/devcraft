import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { amount, serviceTier, customerEmail } = req.body

  if (!amount || amount < 50) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        service_tier: serviceTier || 'unknown',
        customer_email: customerEmail || '',
      },
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: err.message })
  }
}
