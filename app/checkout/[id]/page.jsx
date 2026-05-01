'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
export default function Checkout() {
  const { id: cardId } = useParams()
  const router = useRouter()

  // State Management
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan'
  })

  const [paymentMethod, setPaymentMethod] = useState('COD')

  // Calculated Values
  const totalPrice = useMemo(() => (card ? card.price * quantity : 0), [card, quantity])

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`/api/cards?id=${cardId}`)
        if (!response.ok) throw new Error('Product not found')
        const data = await response.json()
        setCard(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (cardId) fetchCard()
  }, [cardId])

  const handleOrder = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/Order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingName: shippingAddress.name,
          shippingAddress: shippingAddress.address,
          shippingEmail: shippingAddress.email,
          shippingPhone: shippingAddress.phone,
          shippingCity: shippingAddress.city,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          products: [{
            productId: cardId,
            name: card.name,
            price: card.price,
            quantity,
            image: card.image
          }],
          totalPrice,
          paymentMethod
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Order placed successfully!')
        router.push('/dashboard')
      } else {
        throw new Error(result.message || 'Failed to place order')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Secure Checkout...</div>

  if (!card) return <div className="min-h-screen flex items-center justify-center">Card not found</div>

 return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8">
        
        {/* LEFT: Shipping & Payment Details */}
        {/* On mobile, this stays at the bottom so the user sees what they are buying first */}
        <div className="lg:col-span-8 space-y-6">
          <header className="hidden lg:block">
            <h1 className="text-3xl font-black tracking-tight uppercase">Checkout</h1>
            <p className="text-slate-500 mt-1 text-sm tracking-tight">Review your order and select a payment method.</p>
          </header>

          <Link href="/home" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
            ← Back to home 
          </Link>

          <form onSubmit={handleOrder} className="space-y-6">
            {/* Shipping Information Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">01. Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Recipient Name" className="checkout-input md:col-span-2" 
                  value={shippingAddress.name} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}   />
                
                <input required type="email" placeholder="Email Address" className="checkout-input" 
                  value={shippingAddress.email} onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})} />
                
                <input required type="tel" placeholder="Phone Number" className="checkout-input" 
                  value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} />
                
                <input required placeholder="Street Address" className="checkout-input md:col-span-2" 
                  value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} />
                
                <input required placeholder="City" className="checkout-input" 
                  value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} />
                
                <input required placeholder="Postal Code" className="checkout-input" 
                  value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})} />
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]  mb-6">02. Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['COD'].map((method) => (
                  <label key={method} className={`relative flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100'}`}>
                    <input type="radio" name="payment" className="sr-only" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                    <span className="font-bold text-sm uppercase tracking-widest">{method}</span>
                    <div className={`h-4 w-4 rounded-full border-2 border-black flex items-center justify-center ${paymentMethod === method ? 'bg-black' : 'bg-transparent'}`}>
                       {paymentMethod === method && <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Confirm Button - Sticky on Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 lg:relative lg:bg-transparent lg:border-none lg:p-0 z-50">
                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 md:py-6 rounded-xl md:rounded-3xl font-black text-lg md:text-xl hover:bg-yellow-400 hover:text-black transition-all active:scale-[0.98] disabled:bg-slate-200">
                {isSubmitting ? "PROCESSING..." : `CONFIRM ORDER — RS ${totalPrice.toFixed(2)}-`}
                </button>
            </div>
            {/* Spacer for sticky button on mobile */}
            <div className="h-20 lg:hidden"></div>
          </form>
        </div>

        {/* RIGHT: Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <aside className="lg:sticky lg:top-8 bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-lg lg:shadow-xl space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase italic">Summary</h2>
                <span className="lg:hidden text-[10px] font-bold bg-slate-100 px-2 py-1 rounded tracking-tighter uppercase">Step 1 of 2</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <img src={card.image} className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover border border-slate-100" alt={card.name} />
              <div className="flex-1">
                <h4 className="font-bold text-sm md:text-base leading-tight">{card.name}</h4>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">{card.category}</p>
                <p className="font-black text-lg mt-1 ">RS {card.price} \-</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quantity</span>
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-1 border-2 border-slate-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 font-black hover:text-yellow-500">-</button>
                  <span className="font-black text-sm w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 font-black hover:text-yellow-500">+</button>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-bold">Rs{(card.price * quantity).toFixed(2)} \-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Shipping</span>
                <span className="text-black font-black uppercase text-[10px] tracking-widest bg-yellow-400 px-2 py-0.5 rounded">Free</span>
              </div>
              <div className="border-t-2 border-black pt-4 flex justify-between items-end">
                <span className="font-black uppercase text-xs">Total Amount</span>
                <span className="text-3xl font-black tracking-tighter">RS {totalPrice.toFixed(2)}\- </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .checkout-input {
          @apply w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all text-sm font-bold placeholder:text-slate-300 placeholder:font-medium;
        }
      `}</style>
    </div>
  )
}