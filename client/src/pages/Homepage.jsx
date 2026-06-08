import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationBar from '../components/LocationBar';
import { API_BASE_URL } from '../App';
import { Tag, Clock, Star, MapPin } from 'lucide-react';

const foodCuisines = [
  { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=60' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60' },
  { name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60' },
  { name: 'Momos', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&auto=format&fit=crop&q=60' },
  { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&auto=format&fit=crop&q=60' },
  { name: 'Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=60' }
];

function Homepage({ location, detectLocation, updateLocationManually, cart }) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('delivery'); // 'delivery', 'dining', 'nightlife'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/restaurants`);
      const json = await res.json();
      if (json.success) {
        setRestaurants(json.data);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter restaurants based on Search Query and Selected Circular Cuisine
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          restaurant.cuisines.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCuisine = selectedCuisine 
      ? restaurant.cuisines.some(c => c.toLowerCase().includes(selectedCuisine.toLowerCase()))
      : true;

    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="anim-fade">
      {/* Top sticky location navigation */}
      <LocationBar 
        location={location} 
        detectLocation={detectLocation} 
        updateLocationManually={updateLocationManually} 
        cart={cart}
      />

      {/* Hero Header Section */}
      <header className="hero">
        <h1 className="hero-logo">zomato</h1>
        <p className="hero-subtitle">Discover the best food & drinks in {location.city}</p>
        
        <div className="hero-search-box">
          <div className="hero-location-select">
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <input 
              type="text" 
              readOnly 
              value={location.loading ? 'Detecting your live pincode...' : `${location.city} (${location.pincode})`}
            />
          </div>
          <div className="hero-search-input-wrapper">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search for restaurants or cuisines..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedCuisine(null); // Clear cuisine bubble filter if searching
              }}
            />
          </div>
        </div>
      </header>

      {/* Banner indicating India-Wide Special Offer availability */}
      <div className="offers-bar">
        <div className="container offers-bar-content">
          <Tag size={16} />
          <span>ALL INDIA LAUNCH OFFER: Use code <strong>ZOMATO50</strong> for 50% discount. Live in <strong>{location.pincode}</strong>!</span>
          <span className="offer-tag">ACTIVE</span>
        </div>
      </div>

      {/* Zomato Main tabs */}
      <section className="category-tabs-container">
        <div className="container category-tabs">
          <div 
            className={`category-tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => { setActiveTab('delivery'); setSelectedCuisine(null); }}
          >
            <div className="category-icon-wrapper">
              <Clock size={24} />
            </div>
            <span>Delivery</span>
          </div>

          <div 
            className={`category-tab ${activeTab === 'dining' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dining'); setSelectedCuisine(null); }}
          >
            <div className="category-icon-wrapper">
              <Star size={24} />
            </div>
            <span>Dining Out</span>
          </div>

          <div 
            className={`category-tab ${activeTab === 'nightlife' ? 'active' : ''}`}
            onClick={() => { setActiveTab('nightlife'); setSelectedCuisine(null); }}
          >
            <div className="category-icon-wrapper">
              <Tag size={24} />
            </div>
            <span>Nightlife</span>
          </div>
        </div>
      </section>

      {/* Circular Food Items ("Inspiration for your first order") */}
      {activeTab === 'delivery' && (
        <section className="circular-categories container">
          <h2 className="circular-title">Inspiration for your first order</h2>
          <div className="circular-grid">
            {foodCuisines.map((cuisine, idx) => (
              <div 
                key={idx} 
                className="circular-item"
                onClick={() => setSelectedCuisine(selectedCuisine === cuisine.name ? null : cuisine.name)}
                style={{ 
                  opacity: selectedCuisine && selectedCuisine !== cuisine.name ? 0.6 : 1,
                  transform: selectedCuisine === cuisine.name ? 'scale(1.03)' : 'none'
                }}
              >
                <div 
                  className="circular-image-wrapper"
                  style={{ 
                    border: selectedCuisine === cuisine.name ? '3px solid var(--primary)' : 'none' 
                  }}
                >
                  <img src={cuisine.image} alt={cuisine.name} />
                </div>
                <span className="circular-name" style={{ fontWeight: selectedCuisine === cuisine.name ? '700' : '500' }}>
                  {cuisine.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Restaurant Section */}
      <main className="restaurant-section container anim-slide">
        {selectedCuisine ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Showing {selectedCuisine} Restaurants</h2>
            <button 
              onClick={() => setSelectedCuisine(null)} 
              style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <h2 className="section-title">
            {activeTab === 'delivery' 
              ? `Best Food Delivery Restaurants in ${location.city}` 
              : activeTab === 'dining' 
                ? `Popular Dining Venues in ${location.city}`
                : `Trendy Nightlife Spots in ${location.city}`
            }
          </h2>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="spinner dark"></div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <h3>No restaurants found matching your selection</h3>
            <p style={{ marginTop: '10px' }}>Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="restaurant-grid">
            {filteredRestaurants.map((restaurant) => (
              <div 
                key={restaurant.id} 
                className="restaurant-card"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <div className="restaurant-card-img-wrapper">
                  <img src={restaurant.image_url} alt={restaurant.name} />
                  {restaurant.discount_text && (
                    <span className="discount-badge">{restaurant.discount_text}</span>
                  )}
                </div>

                <div className="restaurant-card-info">
                  <div className="restaurant-card-row">
                    <h3 className="restaurant-card-name">{restaurant.name}</h3>
                    <div className="rating-badge">
                      <span>{restaurant.rating || '4.0'}</span>
                      <Star size={12} fill="var(--white)" />
                    </div>
                  </div>

                  <div className="restaurant-card-row" style={{ marginBottom: 0 }}>
                    <span className="restaurant-card-cuisines">
                      {restaurant.cuisines.join(', ')}
                    </span>
                    <span className="restaurant-card-price">
                      ₹{restaurant.cost_for_two} for two
                    </span>
                  </div>

                  <div className="restaurant-card-time">
                    <Clock size={14} />
                    <span>{restaurant.delivery_time} mins • Deliver to {location.pincode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <h2 className="footer-logo">zomato</h2>
          </div>

          <div className="footer-grid">
            <div>
              <h4 className="footer-col-title">About Zomato</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Who We Are</a>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Work With Us</a>
                <a href="#" className="footer-link">Report Fraud</a>
              </div>
            </div>
            <div>
              <h4 className="footer-col-title">Zomaverse</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Zomato</a>
                <a href="#" className="footer-link">Blinkit</a>
                <a href="#" className="footer-link">Feeding India</a>
                <a href="#" className="footer-link">Hyperpure</a>
              </div>
            </div>
            <div>
              <h4 className="footer-col-title">For Restaurants</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Partner With Us</a>
                <a href="#" className="footer-link">Apps For You</a>
              </div>
            </div>
            <div>
              <h4 className="footer-col-title">Learn More</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Privacy Policy</a>
                <a href="#" className="footer-link">Security Terms</a>
                <a href="#" className="footer-link">Sitemap</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2026 © Zomato™ Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
