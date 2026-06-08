import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import RestaurantDetails from './pages/RestaurantDetails';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import AdminDashboard from './pages/AdminDashboard';

export const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const navigate = useNavigate();
  // Cart State: { restaurantId, restaurantName, items: [{ id, name, price, quantity, customizations: [] }] }
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('zomato_cart');
    return saved ? JSON.parse(saved) : { restaurantId: null, restaurantName: null, items: [] };
  });

  // Location State
  const [location, setLocation] = useState({
    pincode: '110001',
    city: 'New Delhi',
    address: 'Connaught Place',
    loading: true,
    error: null
  });

  // Keep cart synced with local storage
  useEffect(() => {
    localStorage.setItem('zomato_cart', JSON.stringify(cart));
  }, [cart]);

  // Geolocation detection on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding via OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          
          if (data && data.address) {
            const pincode = data.address.postcode || '110001';
            const city = data.address.city || data.address.town || data.address.state_district || 'New Delhi';
            const address = data.address.suburb || data.address.neighbourhood || data.address.road || 'Connaught Place';
            
            setLocation({
              pincode: pincode.replace(/\s/g, ''), // remove space if any (e.g. 110 001)
              city,
              address,
              loading: false,
              error: null
            });
          } else {
            throw new Error('Reverse geocoding returned no address details');
          }
        } catch (err) {
          console.error('Error reverse geocoding location:', err);
          // Standard fallback
          setLocation({
            pincode: '110001',
            city: 'New Delhi',
            address: 'Connaught Place (Fallback)',
            loading: false,
            error: 'Could not resolve pincode automatically. Using default.'
          });
        }
      },
      (error) => {
        console.warn('Geolocation access denied or failed:', error.message);
        setLocation({
          pincode: '110001',
          city: 'New Delhi',
          address: 'Connaught Place (Permission Denied)',
          loading: false,
          error: 'Geolocation access denied.'
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Modify location manually
  const updateLocationManually = (newPincode, newCity, newAddress) => {
    setLocation({
      pincode: newPincode,
      city: newCity || 'India Delivery Zone',
      address: newAddress || 'Custom Location',
      loading: false,
      error: null
    });
  };

  // Cart Functions
  const addToCart = (restaurantId, restaurantName, item) => {
    // If cart has items from another restaurant, we must confirm replacement
    if (cart.restaurantId && cart.restaurantId !== restaurantId) {
      if (window.confirm(`Your cart contains items from "${cart.restaurantName}". Would you like to clear your cart and add items from "${restaurantName}" instead?`)) {
        setCart({
          restaurantId,
          restaurantName,
          items: [{ ...item }]
        });
      }
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        i => i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
      );

      let updatedItems = [...prevCart.items];

      if (existingItemIndex > -1) {
        updatedItems[existingItemIndex].quantity += item.quantity;
      } else {
        updatedItems.push({ ...item });
      }

      return {
        restaurantId,
        restaurantName,
        items: updatedItems
      };
    });
  };

  const updateCartQty = (itemId, customizations, delta) => {
    setCart(prevCart => {
      const targetIndex = prevCart.items.findIndex(
        i => i.id === itemId && JSON.stringify(i.customizations) === JSON.stringify(customizations)
      );

      if (targetIndex === -1) return prevCart;

      let updatedItems = [...prevCart.items];
      const newQty = updatedItems[targetIndex].quantity + delta;

      if (newQty <= 0) {
        updatedItems.splice(targetIndex, 1);
      } else {
        updatedItems[targetIndex].quantity = newQty;
      }

      const hasItems = updatedItems.length > 0;
      return {
        restaurantId: hasItems ? prevCart.restaurantId : null,
        restaurantName: hasItems ? prevCart.restaurantName : null,
        items: updatedItems
      };
    });
  };

  const clearCart = () => {
    setCart({
      restaurantId: null,
      restaurantName: null,
      items: []
    });
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Homepage 
            location={location} 
            detectLocation={detectLocation}
            updateLocationManually={updateLocationManually}
            cart={cart}
          />
        } 
      />
      <Route 
        path="/restaurant/:id" 
        element={
          <RestaurantDetails 
            location={location} 
            cart={cart} 
            addToCart={addToCart} 
            updateCartQty={updateCartQty}
          />
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <Checkout 
            location={location} 
            cart={cart} 
            updateCartQty={updateCartQty}
            clearCart={clearCart}
          />
        } 
      />
      <Route 
        path="/order-status/:id" 
        element={<OrderStatus />} 
      />
      <Route 
        path="/admin/*" 
        element={<AdminDashboard />} 
      />
    </Routes>
  );
}

export default App;
