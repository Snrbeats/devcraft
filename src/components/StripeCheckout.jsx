import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const C = {
  cream:"#FDF6EC", amber:"#D4622A", amberLight:"#F08040", amberPale:"#FDE8D8",
  brown:"#2C1810", brownLight:"#8B6355", green:"#2D6A4F", greenPale:"#D8F0E6",
  border:"#EED8C8", white:"#FFFFFF", cream2:"#FFF9F4",
}

const Spin = ({ dark=false }) => (
  <span style={{
    width:16, height:16,
    border: dark ? "2px solid "+C.amber : "2px solid #fff",
    borderTopColor:"transparent", borderRadius:"50%",
    display:"inline-block", animation:"spin 0.7s linear infinite",
  }}/>
)

// ── Inner form (must be inside <Elements>) ────────
function PaymentForm({ total, serviceTier, customerEmail, onSuccess }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setError("")
    setLoading(true)

    const { error: submitErr } = await elements.submit()
    if (submitErr) {
      setError(submitErr.message)
      setLoading(false)
      return
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
        receipt_email: customerEmail,
      },
      redirect: "if_required",
    })

    if (confirmErr) {
      setError(confirmErr.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{
        background: C.white, borderRadius:12, padding:20,
        border: "1.5px solid "+C.border,
      }}>
        <PaymentElement options={{ layout:"tabs" }}/>
      </div>

      {error && (
        <div style={{
          background:"#FEE2E2", color:"#C0392B",
          padding:"10px 14px", borderRadius:8, fontSize:13,
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        background:C.greenPale, borderRadius:10,
        padding:"12px 16px", display:"flex", gap:10,
        fontSize:13, color:C.green,
      }}>
        🔒 <span>Secured by Stripe. Your payment info is never stored on our servers.</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stripe || loading}
        style={{
          width:"100%", padding:"16px 24px", borderRadius:12,
          border:"none", fontWeight:700, fontSize:16, cursor: !stripe||loading ? "not-allowed":"pointer",
          background: !stripe||loading ? C.border : C.amber,
          color:"#fff", display:"flex", alignItems:"center",
          justifyContent:"center", gap:10, transition:"background 0.2s",
          opacity: !stripe||loading ? 0.7 : 1,
        }}
      >
        {loading
          ? <><Spin/>Processing…</>
          : <>Pay ${total.toLocaleString()} →</>
        }
      </button>
    </div>
  )
}

// ── Main export: creates payment intent + mounts Elements ──
export default function StripeCheckout({ total, serviceTier, customerEmail, onSuccess }) {
  const [clientSecret, setClientSecret] = useState("")
  const [fetchError,   setFetchError]   = useState("")
  const [loadingIntent, setLoadingIntent] = useState(true)

  useEffect(() => {
    setLoadingIntent(true)
    setFetchError("")

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, serviceTier, customerEmail }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setClientSecret(data.clientSecret)
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoadingIntent(false))
  }, [total])

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: C.amber,
      colorBackground: C.cream2,
      colorText: C.brown,
      colorDanger: "#C0392B",
      fontFamily: "DM Sans, sans-serif",
      borderRadius: "10px",
    },
  }

  if (loadingIntent) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"40px 0", color:C.brownLight }}>
      <Spin dark/>
      <span>Setting up secure payment…</span>
    </div>
  )

  if (fetchError) return (
    <div style={{ background:"#FEE2E2", color:"#C0392B", padding:"16px 20px", borderRadius:12, fontSize:14 }}>
      ⚠️ Could not initialize payment: {fetchError}<br/>
      <span style={{ fontSize:12, marginTop:8, display:"block", color:"#999" }}>
        Make sure STRIPE_SECRET_KEY is set in your Vercel environment variables.
      </span>
    </div>
  )

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm
        total={total}
        serviceTier={serviceTier}
        customerEmail={customerEmail}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}
