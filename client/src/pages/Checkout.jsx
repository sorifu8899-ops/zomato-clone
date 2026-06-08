import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationBar from '../components/LocationBar';
import { API_BASE_URL } from '../App';
import { CreditCard, Truck, Tag, ShieldCheck, QrCode, Phone, User, MapPin } from 'lucide-react';

function Checkout({ location, cart, updateCartQty, clearCart }) {
  const navigate = useNavigate();

  // Delivery details form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState(location.pincode);

  // Promo Code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount, description }
  const [promoError, setPromoError] = useState('');
  const [availableOffers, setAvailableOffers] = useState([]);

  // Payment method state: 'COD', 'UPI', 'CARD'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Mock Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Load available offers and set pincode if location changes
  useEffect(() => {
    fetchOffers();
    setPincode(location.pincode);
  }, [location.pincode]);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/offers`);
      const json = await res.json();
      if (json.success) {
        setAvailableOffers(json.data);
      }
    } catch (err) {
      console.error('Error fetching promo offers:', err);
    }
  };

  // Cart Subtotal Calculation
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 0 ? 40 : 0;
  
  // Calculate discount
  const discount = appliedPromo ? Math.min(appliedPromo.discount, subtotal) : 0;
  const totalAmount = Math.max(0, subtotal + deliveryCharge - discount);

  // Apply Coupon
  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || promoCode;
    if (!code) return;

    setPromoError('');
    try {
      const res = await fetch(`${API_BASE_URL}/offers/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, pincode, subtotal })
      });
      const json = await res.json();
      if (json.success) {
        setAppliedPromo(json.data);
        setPromoCode('');
      } else {
        setPromoError(json.message);
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError('Error validating coupon. Try again.');
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  // Process checkout
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (cart.items.length === 0) {
      setCheckoutError('Your cart is empty. Please add items before checking out.');
      return;
    }

    // Pincode validation: must be 6 digits
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(pincode)) {
      setCheckoutError('Please enter a valid 6-digit Indian pincode (e.g. 110001).');
      return;
    }

    if (paymentMethod === 'CARD') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setCheckoutError('Please fill out all card payment details.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setCheckoutError('Invalid card number. Must be 16 digits.');
        return;
      }
    }

    try {
      setIsProcessing(true);

      // 1. Create Order
      const orderRes = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          restaurant_id: cart.restaurantId,
          items: cart.items,
          subtotal,
          discount_applied: discount,
          delivery_charge: deliveryCharge,
          total_amount: totalAmount,
          delivery_pincode: pincode,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod
        })
      });

      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        throw new Error(orderJson.message || 'Failed to register your order.');
      }

      const placedOrder = orderJson.data;

      // 2. Process mock payment for Cards/UPI
      if (paymentMethod !== 'COD') {
        const payRes = await fetch(`${API_BASE_URL}/orders/${placedOrder.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_details: paymentMethod === 'CARD' ? { cardNumber } : { upiRef: 'mock-upi-ref-123' }
          })
        });

        const payJson = await payRes.json();
        if (!payJson.success) {
          throw new Error(payJson.message || 'Payment simulation failed.');
        }
      }

      // Success! Clear cart and redirect to status page
      clearCart();
      navigate(`/order-status/${placedOrder.id}`);

    } catch (err) {
      setCheckoutError(err.message || 'An error occurred during order submission.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (subtotal === 0) {
    return (
      <div>
        <LocationBar location={location} detectLocation={() => {}} updateLocationManually={() => {}} cart={cart} />
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <ShoppingBag size={64} style={{ color: 'var(--text-light)', marginBottom: '20px' }} />
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Add delicious items from the homepage to start ordering.</p>
          <button onClick={() => navigate('/')} className="place-order-btn" style={{ maxWidth: '240px', margin: '24px auto' }}>
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-fade">
      <LocationBar location={location} detectLocation={() => {}} updateLocationManually={() => {}} cart={cart} />

      <main className="container checkout-container">
        
        {/* Main Column: Delivery Address & Payments */}
        <form onSubmit={handleCheckoutSubmit} className="checkout-main">
          
          {/* Delivery Details */}
          <div className="checkout-card anim-slide">
            <h3 className="checkout-card-title">
              <Truck size={20} style={{ color: 'var(--primary)' }} />
              <span>Delivery Details</span>
            </h3>

            <div className="input-grid">
              <div className="input-wrapper">
                <label>Contact Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    pattern="[0-9]{10}"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="input-wrapper full-width">
                <label>Delivery Address</label>
                <textarea 
                  placeholder="Flat No, Building Name, Street address" 
                  rows="3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="input-wrapper">
                <label>Delivery Pincode (India Only)</label>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  required
                />
                <span className="pincode-status-indicator valid">
                  <ShieldCheck size={14} /> Delivers to India. Pincode Active.
                </span>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="checkout-card anim-slide" style={{ animationDelay: '0.1s' }}>
            <h3 className="checkout-card-title">
              <CreditCard size={20} style={{ color: 'var(--primary)' }} />
              <span>Choose Payment Method</span>
            </h3>

            <div className="payment-options">
              {/* Cash on Delivery */}
              <div 
                className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="payment-option-header">
                  <input type="radio" checked={paymentMethod === 'COD'} readOnly style={{ accentColor: 'var(--primary)' }} />
                  <span>Cash on Delivery (COD)</span>
                </div>
              </div>

              {/* UPI Instant Scan */}
              <div 
                className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <div className="payment-option-header">
                  <input type="radio" checked={paymentMethod === 'UPI'} readOnly style={{ accentColor: 'var(--primary)' }} />
                  <span>Pay via UPI (GPay/PhonePe/QR Code)</span>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="payment-option-details upi-scan-container">
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Scan the QR Code below to transfer ₹{totalAmount} instantly from any UPI App.
                    </p>
                    <div className="qr-code-placeholder">
                      {/* Simple mock QR code */}
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=zomato@sbi%26pn=Zomato%26am=10.00%26cu=INR" alt="Mock UPI QR Code" />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                      UPI ID: payzomato@icici
                    </span>
                  </div>
                )}
              </div>

              {/* Credit/Debit Card */}
              <div 
                className={`payment-option ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <div className="payment-option-header">
                  <input type="radio" checked={paymentMethod === 'CARD'} readOnly style={{ accentColor: 'var(--primary)' }} />
                  <span>Credit / Debit Card</span>
                </div>

                {paymentMethod === 'CARD' && (
                  <div className="payment-option-details">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="input-wrapper">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          placeholder="4111 2222 3333 4444" 
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          maxLength={19}
                        />
                      </div>
                      <div className="input-grid" style={{ marginBottom: 0 }}>
                        <div className="input-wrapper">
                          <label>Expiry (MM/YY)</label>
                          <input 
                            type="text" 
                            placeholder="12/28" 
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div className="input-wrapper">
                          <label>CVV</label>
                          <input 
                            type="password" 
                            placeholder="***" 
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Sidebar Column: Cart summary & checkout action */}
        <aside className="checkout-sidebar">
          
          {/* Cart Items Summary */}
          <div className="checkout-card anim-slide" style={{ animationDelay: '0.15s' }}>
            <h3 className="checkout-card-title" style={{ borderBottom: 'none', marginBottom: '10px' }}>
              Summary from "{cart.restaurantName}"
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              {cart.items.map((item, idx) => (
                <div key={idx} className="checkout-cart-item">
                  <div className="checkout-item-details">
                    <span className="checkout-item-name">{item.name}</span>
                    {item.customizationSummary && (
                      <p className="checkout-item-customizations">({item.customizationSummary})</p>
                    )}
                  </div>
                  <div className="checkout-item-qty-price">
                    <span>{item.quantity} x ₹{item.price}</span>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons Card Widget */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={16} style={{ color: 'var(--primary)' }} /> Coupons & Offers
              </h4>
              
              {appliedPromo ? (
                <div style={{ background: 'var(--success-light)', border: '1px dashed var(--success)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '700', color: 'var(--success)', fontSize: '13px' }}>{appliedPromo.code} Applied!</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved ₹{discount}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '12px' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-widget">
                    <input 
                      type="text" 
                      placeholder="Enter Promo Code" 
                      className="coupon-input"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button type="button" className="coupon-btn" onClick={() => handleApplyCoupon()}>
                      Apply
                    </button>
                  </div>
                  
                  {promoError && (
                    <p style={{ color: 'var(--primary)', fontSize: '11px', marginBottom: '10px' }}>{promoError}</p>
                  )}

                  <div className="suggested-offers">
                    {availableOffers.map((offer) => (
                      <div 
                        key={offer.code} 
                        className="suggested-offer-card"
                        onClick={() => handleApplyCoupon(offer.code)}
                      >
                        <div>
                          <span className="suggested-offer-code">{offer.code}</span>
                          <p className="suggested-offer-desc">{offer.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bill Details */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div className="bill-row">
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Charge</span>
                <span>₹{deliveryCharge}</span>
              </div>
              {appliedPromo && (
                <div className="bill-row discount">
                  <span>Promo Discount ({appliedPromo.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="bill-row total">
                <span>Grand Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {checkoutError && (
              <p style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '15px', textAlign: 'center' }}>
                {checkoutError}
              </p>
            )}

            <button 
              type="button" 
              onClick={handleCheckoutSubmit}
              disabled={isProcessing}
              className="place-order-btn"
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Place Order • ₹{totalAmount}</span>
              )}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Checkout;
