import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Search, ShoppingBag, RefreshCw, ChevronDown, Check, ShieldAlert } from 'lucide-react';

function LocationBar({ location, detectLocation, updateLocationManually, cart }) {
  const navigate = useNavigate();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualPin, setManualPin] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualError, setManualError] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(manualPin)) {
      setManualError('Please enter a valid 6-digit Indian pincode');
      return;
    }
    setManualError('');
    updateLocationManually(manualPin, manualCity || 'India Delivery Zone', 'Manually Specified');
    setShowLocationModal(false);
  };

  const totalCartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="logo">
            zomato<span>India</span>
          </Link>

          {/* Location & Search Bar (Matches Zomato style) */}
          <div className="nav-search-bar">
            <div className="nav-location" onClick={() => setShowLocationModal(true)} style={{ cursor: 'pointer' }}>
              <MapPin size={18} className="anim-pulse" style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span className="nav-location-text">
                {location.loading ? 'Detecting...' : `${location.city} (${location.pincode})`}
              </span>
              <ChevronDown size={14} style={{ marginLeft: 'auto', color: 'var(--text-light)' }} />
            </div>

            <div className="nav-search-input-wrapper">
              <Search size={18} style={{ color: 'var(--text-light)', marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className="nav-search-input"
                onClick={() => navigate('/')}
              />
            </div>
          </div>

          {/* Right Links */}
          <div className="nav-right">
            <span className="nav-link" onClick={() => setShowLocationModal(true)}>
              Change Location
            </span>
            <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Admin Panel
            </Link>
            
            {/* Cart Bag */}
            <div className="cart-badge-container" onClick={() => navigate('/checkout')}>
              <ShoppingBag size={22} style={{ color: totalCartCount > 0 ? 'var(--primary)' : 'var(--text-dark)' }} />
              {totalCartCount > 0 && (
                <div className="cart-count">{totalCartCount}</div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Manual Location Overlay Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px' }}>Select Delivery Location</h3>
              <button onClick={() => setShowLocationModal(false)} style={{ fontSize: '20px', fontWeight: 'bold' }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <button 
                onClick={() => {
                  detectLocation();
                  setShowLocationModal(false);
                }}
                className="place-order-btn"
                style={{ 
                  background: 'var(--bg-light)', 
                  color: 'var(--primary)', 
                  border: '1px solid var(--primary)', 
                  marginBottom: '20px',
                  padding: '10px'
                }}
              >
                <RefreshCw size={16} className={location.loading ? 'anim-pulse' : ''} />
                Detect Live Geolocation
              </button>

              <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '13px', color: 'var(--text-light)' }}>
                — OR ENTER MANUALLY —
              </div>

              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div className="input-wrapper">
                  <label>Enter Indian Pincode</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 110001 or 400001" 
                    value={manualPin}
                    onChange={(e) => setManualPin(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="input-wrapper">
                  <label>City Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mumbai, Bangalore" 
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                  />
                </div>

                {manualError && (
                  <div style={{ color: 'var(--primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={14} /> {manualError}
                  </div>
                )}

                <div className="pincode-status-indicator valid" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Offer Active All Over India
                </div>

                <button type="submit" className="place-order-btn" style={{ padding: '10px', marginTop: '10px' }}>
                  Apply Location
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LocationBar;
