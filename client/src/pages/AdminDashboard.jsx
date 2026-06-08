import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../App';
import { ShieldCheck, IndianRupee, ShoppingBag, MapPin, BarChart3, PlusCircle, Check, Play, Edit, RotateCcw } from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders', 'add-restaurant', 'add-dish'
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    activePincodes: 0,
    statusCounts: {}
  });
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Restaurant form state
  const [restName, setRestName] = useState('');
  const [restCuisines, setRestCuisines] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restDeliveryTime, setRestDeliveryTime] = useState(30);
  const [restCost, setRestCost] = useState(300);
  const [restImage, setRestImage] = useState('');
  const [restDiscount, setRestDiscount] = useState('10% OFF');
  const [restSuccess, setRestSuccess] = useState('');

  // Add Dish form state
  const [dishRestId, setDishRestId] = useState('');
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishDiscountPrice, setDishDiscountPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Veg');
  const [dishCourse, setDishCourse] = useState('Main Course');
  const [dishDescription, setDishDescription] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [dishSuccess, setDishSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeSubTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`);
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson.data);

      // Fetch orders
      const ordersRes = await fetch(`${API_BASE_URL}/admin/orders`);
      const ordersJson = await ordersRes.json();
      if (ordersJson.success) setOrders(ordersJson.data);

      // Fetch restaurants (for select dropdowns)
      const restRes = await fetch(`${API_BASE_URL}/restaurants`);
      const restJson = await restRes.json();
      if (restJson.success) setRestaurants(restJson.data);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update order status or payment status
  const handleUpdateOrder = async (orderId, updateFields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields)
      });
      const json = await res.json();
      if (json.success) {
        // Refresh local orders list
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updateFields } : o));
        
        // Refresh stats
        const statsRes = await fetch(`${API_BASE_URL}/admin/stats`);
        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // Add restaurant form submit
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setRestSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restName,
          cuisines: restCuisines,
          address: restAddress,
          delivery_time: restDeliveryTime,
          cost_for_two: restCost,
          image_url: restImage,
          discount_text: restDiscount
        })
      });
      const json = await res.json();
      if (json.success) {
        setRestSuccess(`Restaurant "${restName}" added successfully!`);
        // Reset form
        setRestName('');
        setRestCuisines('');
        setRestAddress('');
        setRestDeliveryTime(30);
        setRestCost(300);
        setRestImage('');
        setRestDiscount('10% OFF');
      }
    } catch (err) {
      console.error('Error adding restaurant:', err);
    }
  };

  // Add dish form submit
  const handleAddDish = async (e) => {
    e.preventDefault();
    setDishSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: dishRestId,
          name: dishName,
          price: dishPrice,
          discount_price: dishDiscountPrice || null,
          category: dishCategory,
          course: dishCourse,
          description: dishDescription,
          image_url: dishImage
        })
      });
      const json = await res.json();
      if (json.success) {
        setDishSuccess(`Dish "${dishName}" added successfully!`);
        // Reset form
        setDishName('');
        setDishPrice('');
        setDishDiscountPrice('');
        setDishDescription('');
        setDishImage('');
      }
    } catch (err) {
      console.error('Error adding dish:', err);
    }
  };

  return (
    <div className="admin-layout anim-fade">
      {/* Sidebar navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          zomato<span>Admin</span>
        </div>

        <div className="admin-sidebar-menu">
          <div 
            className={`admin-sidebar-item ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            <BarChart3 size={18} />
            <span>Orders Manager</span>
          </div>

          <div 
            className={`admin-sidebar-item ${activeSubTab === 'add-restaurant' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('add-restaurant')}
          >
            <PlusCircle size={18} />
            <span>Add Restaurant</span>
          </div>

          <div 
            className={`admin-sidebar-item ${activeSubTab === 'add-dish' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('add-dish')}
          >
            <PlusCircle size={18} />
            <span>Add Menu Dish</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="place-order-btn" 
          style={{ marginTop: 'auto', background: 'var(--text-dark)', padding: '10px' }}
        >
          Customer View
        </button>
      </aside>

      {/* Main dashboard content */}
      <main className="admin-content">
        
        {/* Top Header stats */}
        <section className="admin-stats-grid">
          {/* Revenue */}
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <span className="admin-stat-label">Total Revenue</span>
              <span className="admin-stat-val">₹{stats.totalSales || 0}</span>
            </div>
            <div className="admin-stat-icon">
              <IndianRupee size={22} />
            </div>
          </div>

          {/* Orders count */}
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <span className="admin-stat-label">Total Orders</span>
              <span className="admin-stat-val">{stats.totalOrders || 0}</span>
            </div>
            <div className="admin-stat-icon" style={{ background: '#e3f2fd', color: '#1e88e5' }}>
              <ShoppingBag size={22} />
            </div>
          </div>

          {/* Average Order Value */}
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <span className="admin-stat-label">Avg Ticket Size</span>
              <span className="admin-stat-val">₹{stats.avgOrderValue || 0}</span>
            </div>
            <div className="admin-stat-icon" style={{ background: '#e8f5e9', color: '#43a047' }}>
              <ShieldCheck size={22} />
            </div>
          </div>

          {/* Active pincodes */}
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <span className="admin-stat-label">India Pincodes</span>
              <span className="admin-stat-val">{stats.activePincodes || 0}</span>
            </div>
            <div className="admin-stat-icon" style={{ background: '#f3e5f5', color: '#8e24aa' }}>
              <MapPin size={22} />
            </div>
          </div>
        </section>

        {/* Tab body pages */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner dark"></div>
          </div>
        ) : activeSubTab === 'orders' ? (
          <div className="anim-slide">
            <h2 className="section-title">Customer Orders</h2>
            
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Restaurant</th>
                    <th>Ordered Food Items</th>
                    <th>Delivery Address</th>
                    <th>Bill Amount</th>
                    <th>Payment</th>
                    <th>Order Phase</th>
                    <th>Phase Control Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{o.id.substring(0, 8)}</span>
                        </td>
                        <td>
                          <strong>{o.customer_name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.customer_phone}</div>
                        </td>
                        <td>{o.restaurant_name}</td>
                        <td>
                          <div style={{ maxWidth: '200px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {o.items.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '11px' }}>
                                • {item.quantity}x {item.name} {item.customizationSummary && `(${item.customizationSummary})`}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '11px' }}>{o.delivery_address}</div>
                          <strong style={{ fontSize: '11px', color: 'var(--primary)' }}>PIN: {o.delivery_pincode}</strong>
                        </td>
                        <td>
                          <strong>₹{o.total_amount}</strong>
                          <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Sub: ₹{o.subtotal}</div>
                        </td>
                        <td>
                          <span className={`status-badge ${o.payment_status.toLowerCase()}`}>
                            {o.payment_status}
                          </span>
                          {o.payment_status === 'PENDING' && (
                            <button 
                              onClick={() => handleUpdateOrder(o.id, { payment_status: 'PAID' })}
                              style={{ display: 'block', fontSize: '10px', color: 'var(--success)', marginTop: '4px', fontWeight: '600' }}
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${o.order_status.toLowerCase()}`}>
                            {o.order_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {o.order_status === 'PLACED' && (
                              <button 
                                onClick={() => handleUpdateOrder(o.id, { order_status: 'PREPARING' })}
                                className="add-btn" style={{ fontSize: '10px', padding: '4px 8px', width: 'auto' }}
                              >
                                Prepare Food
                              </button>
                            )}
                            {o.order_status === 'PREPARING' && (
                              <button 
                                onClick={() => handleUpdateOrder(o.id, { order_status: 'OUT_FOR_DELIVERY' })}
                                className="add-btn" style={{ fontSize: '10px', padding: '4px 8px', width: 'auto' }}
                              >
                                Dispatch Order
                              </button>
                            )}
                            {o.order_status === 'OUT_FOR_DELIVERY' && (
                              <button 
                                onClick={() => handleUpdateOrder(o.id, { order_status: 'DELIVERED', payment_status: 'PAID' })}
                                className="add-btn" style={{ fontSize: '10px', padding: '4px 8px', width: 'auto', background: 'var(--success)', color: 'white' }}
                              >
                                Mark Delivered
                              </button>
                            )}
                            {o.order_status !== 'DELIVERED' && o.order_status !== 'CANCELLED' && (
                              <button 
                                onClick={() => handleUpdateOrder(o.id, { order_status: 'CANCELLED' })}
                                style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', padding: '4px' }}
                              >
                                Cancel
                              </button>
                            )}
                            {(o.order_status === 'DELIVERED' || o.order_status === 'CANCELLED') && (
                              <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeSubTab === 'add-restaurant' ? (
          <div className="anim-slide">
            <h2 className="section-title">Add New Restaurant</h2>
            
            <form onSubmit={handleAddRestaurant} className="form-card input-grid">
              <div className="input-wrapper full-width">
                <label>Restaurant Name</label>
                <input 
                  type="text" 
                  value={restName}
                  onChange={(e) => setRestName(e.target.value)}
                  placeholder="e.g. Punjabi Tadka"
                  required
                />
              </div>

              <div className="input-wrapper full-width">
                <label>Cuisines (Comma separated list)</label>
                <input 
                  type="text" 
                  value={restCuisines}
                  onChange={(e) => setRestCuisines(e.target.value)}
                  placeholder="e.g. North Indian, Chinese, Fast Food"
                  required
                />
              </div>

              <div className="input-wrapper full-width">
                <label>Complete Address</label>
                <input 
                  type="text" 
                  value={restAddress}
                  onChange={(e) => setRestAddress(e.target.value)}
                  placeholder="e.g. Connaught Place, New Delhi"
                  required
                />
              </div>

              <div className="input-wrapper">
                <label>Avg Delivery Time (mins)</label>
                <input 
                  type="number" 
                  value={restDeliveryTime}
                  onChange={(e) => setRestDeliveryTime(e.target.value)}
                  required
                />
              </div>

              <div className="input-wrapper">
                <label>Cost for Two (₹)</label>
                <input 
                  type="number" 
                  value={restCost}
                  onChange={(e) => setRestCost(e.target.value)}
                  required
                />
              </div>

              <div className="input-wrapper">
                <label>Promo Banner Discount Text</label>
                <input 
                  type="text" 
                  value={restDiscount}
                  onChange={(e) => setRestDiscount(e.target.value)}
                  placeholder="e.g. 50% OFF up to ₹100"
                />
              </div>

              <div className="input-wrapper">
                <label>Restaurant Photo URL (Optional)</label>
                <input 
                  type="text" 
                  value={restImage}
                  onChange={(e) => setRestImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {restSuccess && (
                <div style={{ gridColumn: 'span 2', background: 'var(--success-light)', border: '1px solid var(--success)', padding: '10px', borderRadius: '6px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={18} /> {restSuccess}
                </div>
              )}

              <button type="submit" className="place-order-btn" style={{ gridColumn: 'span 2' }}>
                Add Restaurant
              </button>
            </form>
          </div>
        ) : (
          <div className="anim-slide">
            <h2 className="section-title">Add New Menu Dish</h2>
            
            <form onSubmit={handleAddDish} className="form-card input-grid">
              <div className="input-wrapper full-width">
                <label>Select Restaurant</label>
                <select 
                  value={dishRestId}
                  onChange={(e) => setDishRestId(e.target.value)}
                  style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', fontSize: '14px', width: '100%' }}
                  required
                >
                  <option value="">-- Choose Restaurant --</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-wrapper full-width">
                <label>Dish Name</label>
                <input 
                  type="text" 
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Butter Chicken"
                  required
                />
              </div>

              <div className="input-wrapper">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  placeholder="e.g. 299"
                  required
                />
              </div>

              <div className="input-wrapper">
                <label>Discount Price (₹, Optional)</label>
                <input 
                  type="number" 
                  value={dishDiscountPrice}
                  onChange={(e) => setDishDiscountPrice(e.target.value)}
                  placeholder="e.g. 249"
                />
              </div>

              <div className="input-wrapper">
                <label>Category</label>
                <select 
                  value={dishCategory}
                  onChange={(e) => setDishCategory(e.target.value)}
                  style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', fontSize: '14px', width: '100%' }}
                  required
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>

              <div className="input-wrapper">
                <label>Course Section</label>
                <select 
                  value={dishCourse}
                  onChange={(e) => setDishCourse(e.target.value)}
                  style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', fontSize: '14px', width: '100%' }}
                  required
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div className="input-wrapper full-width">
                <label>Description</label>
                <textarea 
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Describe the dish ingredients and taste..."
                  rows="3"
                ></textarea>
              </div>

              <div className="input-wrapper full-width">
                <label>Food Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={dishImage}
                  onChange={(e) => setDishImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {dishSuccess && (
                <div style={{ gridColumn: 'span 2', background: 'var(--success-light)', border: '1px solid var(--success)', padding: '10px', borderRadius: '6px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={18} /> {dishSuccess}
                </div>
              )}

              <button type="submit" className="place-order-btn" style={{ gridColumn: 'span 2' }}>
                Add Menu Item
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
