import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LocationBar from '../components/LocationBar';
import { API_BASE_URL } from '../App';
import { CheckCircle2, ClipboardList, Flame, Bike, Sparkles, MapPin, Phone } from 'lucide-react';

function OrderStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    
    // Set up polling to update status automatically every 5 seconds
    const interval = setInterval(fetchOrderDetails, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '150px 0' }}>
        <div className="spinner dark"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Order not found</h2>
        <button onClick={() => navigate('/')} className="place-order-btn" style={{ maxWidth: '200px', margin: '20px auto' }}>
          Back to Home
        </button>
      </div>
    );
  }

  // Map database status to readable text
  const statusMapping = {
    PLACED: { step: 1, title: 'Order Placed', desc: 'We have received your order and sent it to the restaurant.' },
    PREPARING: { step: 2, title: 'Preparing Food', desc: 'The chefs are cooking your fresh and delicious meal.' },
    OUT_FOR_DELIVERY: { step: 3, title: 'Out for Delivery', desc: 'Our delivery partner is bringing food to your door.' },
    DELIVERED: { step: 4, title: 'Delivered', desc: 'Enjoy your hot meal! Bon Appétit.' },
    CANCELLED: { step: 0, title: 'Cancelled', desc: 'This order was cancelled.' }
  };

  const currentStep = statusMapping[order.order_status]?.step || 1;
  const isCancelled = order.order_status === 'CANCELLED';

  return (
    <div className="anim-fade" style={{ background: '#fcfcfc', minHeight: '100vh', paddingBottom: '60px' }}>
      <LocationBar 
        location={{ pincode: order.delivery_pincode, city: 'Delivery Zone', loading: false }} 
        detectLocation={() => {}} 
        updateLocationManually={() => {}} 
        cart={{ items: [] }} 
      />

      <main className="container tracking-container anim-slide">
        
        {/* Success header banner */}
        <div className="tracking-header">
          <CheckCircle2 size={56} style={{ color: 'var(--success)', margin: '0 auto 15px' }} />
          <h2 style={{ fontSize: '28px' }}>
            {isCancelled ? 'Order Cancelled' : currentStep === 4 ? 'Food Delivered!' : 'Your order is on the way!'}
          </h2>
          <p className="tracking-id">Order ID: #{order.id}</p>
        </div>

        {/* Real-time Status Tracker Timeline */}
        <div className="checkout-card">
          <h3 className="checkout-card-title" style={{ borderBottom: 'none' }}>Order Tracking Timeline</h3>
          
          <div className="tracking-timeline">
            {/* Step 1: Placed */}
            <div className={`timeline-step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
              <div className="timeline-icon-wrapper">
                <ClipboardList size={18} />
              </div>
              <div className="timeline-content">
                <h4 className="timeline-title">{statusMapping.PLACED.title}</h4>
                <p className="timeline-desc">{statusMapping.PLACED.desc}</p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className={`timeline-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
              <div className="timeline-icon-wrapper">
                <Flame size={18} className={currentStep === 2 ? 'anim-pulse' : ''} />
              </div>
              <div className="timeline-content">
                <h4 className="timeline-title">{statusMapping.PREPARING.title}</h4>
                <p className="timeline-desc">{statusMapping.PREPARING.desc}</p>
              </div>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className={`timeline-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
              <div className="timeline-icon-wrapper">
                <Bike size={18} />
              </div>
              <div className="timeline-content">
                <h4 className="timeline-title">{statusMapping.OUT_FOR_DELIVERY.title}</h4>
                <p className="timeline-desc">{statusMapping.OUT_FOR_DELIVERY.desc}</p>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className={`timeline-step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}`}>
              <div className="timeline-icon-wrapper">
                <Sparkles size={18} />
              </div>
              <div className="timeline-content">
                <h4 className="timeline-title">{statusMapping.DELIVERED.title}</h4>
                <p className="timeline-desc">{statusMapping.DELIVERED.desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details summary */}
        <div className="checkout-card" style={{ marginTop: '24px' }}>
          <h3 className="checkout-card-title">Delivery Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <strong>Delivery Address:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  {order.delivery_address}, {order.delivery_pincode}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Phone size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <strong>Customer Contact:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  {order.customer_name} ({order.customer_phone})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="checkout-card" style={{ marginTop: '24px' }}>
          <h3 className="checkout-card-title">Invoice Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{item.quantity} x {item.name} {item.customizationSummary && `(${item.customizationSummary})`}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div className="bill-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="bill-row">
              <span>Delivery Charge</span>
              <span>₹{order.delivery_charge}</span>
            </div>
            {order.discount_applied > 0 && (
              <div className="bill-row discount">
                <span>Discount Applied</span>
                <span>-₹{order.discount_applied}</span>
              </div>
            )}
            <div className="bill-row total" style={{ marginBottom: 0 }}>
              <span>Total Paid ({order.payment_method})</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="place-order-btn" 
          style={{ marginTop: '30px', background: 'var(--text-dark)' }}
        >
          Back to Homepage
        </button>
      </main>
    </div>
  );
}

export default OrderStatus;
