import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. GET ALL RESTAURANTS
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await db.getRestaurants();
    res.json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET RESTAURANT BY ID + ITS MENU DISHES
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await db.getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    const dishes = await db.getDishes(req.params.id);
    res.json({ success: true, data: { ...restaurant, dishes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET ACTIVE PROMO OFFERS
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await db.getOffers();
    res.json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. VALIDATE PROMO CODE & PINCODE
app.post('/api/offers/validate', async (req, res) => {
  const { code, pincode, subtotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Promo code is required' });
  }

  // Basic validation for Indian Pincodes: Must be 6 digits
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (pincode && !pinRegex.test(pincode)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit Indian pincode' });
  }

  try {
    const offer = await db.getOfferByCode(code);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid promo code' });
    }

    if (subtotal < offer.min_order_value) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value for code ${code} is ₹${offer.min_order_value}` 
      });
    }

    // Offer is valid all over India. If pincode check is required, we simply verify it exists
    let discount = (subtotal * offer.discount_percentage) / 100;
    if (discount > offer.max_discount) {
      discount = offer.max_discount;
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully! Valid all over India.',
      data: {
        code: offer.code,
        discount: Math.round(discount),
        description: offer.description
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. PLACE ORDER
app.post('/api/orders', async (req, res) => {
  const { 
    customer_name, 
    customer_phone, 
    restaurant_id, 
    items, 
    subtotal, 
    discount_applied, 
    delivery_charge, 
    total_amount, 
    delivery_pincode, 
    delivery_address, 
    payment_method 
  } = req.body;

  if (!customer_name || !customer_phone || !restaurant_id || !items || !items.length || !delivery_pincode || !delivery_address || !payment_method) {
    return res.status(400).json({ success: false, message: 'Missing required order details' });
  }

  // Validate Indian Pincode
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinRegex.test(delivery_pincode)) {
    return res.status(400).json({ success: false, message: 'Deliveries only available to valid 6-digit Indian pincodes' });
  }

  try {
    // Save order
    const order = await db.createOrder({
      customer_name,
      customer_phone,
      restaurant_id,
      items,
      subtotal,
      discount_applied,
      delivery_charge,
      total_amount,
      delivery_pincode,
      delivery_address,
      payment_method,
      payment_status: payment_method === 'COD' ? 'PENDING' : 'PENDING',
      order_status: 'PLACED'
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. GET ORDER DETAILS BY ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Add restaurant details to order response for better rendering
    const restaurant = await db.getRestaurantById(order.restaurant_id);
    res.json({ success: true, data: { ...order, restaurant } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. SIMULATE PAYMENT PROCESS (For UPI/Card)
app.post('/api/orders/:id/pay', async (req, res) => {
  const { payment_details } = req.body; // Mock details: card info or UPI reference

  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Simulating delay and payment processor
    console.log(`Processing payment of ₹${order.total_amount} via ${order.payment_method}...`);
    
    // 95% success rate for simulation
    const isSuccess = Math.random() < 0.95;

    if (isSuccess) {
      const updatedOrder = await db.updateOrderStatus(order.id, {
        payment_status: 'PAID',
        order_status: 'PREPARING' // Auto move to preparing when paid
      });
      res.json({ success: true, message: 'Payment completed successfully!', data: updatedOrder });
    } else {
      await db.updateOrderStatus(order.id, { payment_status: 'FAILED' });
      res.status(400).json({ success: false, message: 'Payment authorization failed. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. ADMIN: GET STATS & REPORTS
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. ADMIN: GET ALL ORDERS
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    // Fetch restaurant details for each order to show in admin dashboard
    const restaurants = await db.getRestaurants();
    const formattedOrders = orders.map(order => {
      const rest = restaurants.find(r => r.id === order.restaurant_id);
      return {
        ...order,
        restaurant_name: rest ? rest.name : 'Unknown Restaurant'
      };
    });
    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. ADMIN: UPDATE ORDER STATUS / PAYMENT STATUS
app.put('/api/admin/orders/:id', async (req, res) => {
  const { order_status, payment_status } = req.body;
  const updateData = {};
  if (order_status) updateData.order_status = order_status;
  if (payment_status) updateData.payment_status = payment_status;

  try {
    const updatedOrder = await db.updateOrderStatus(req.params.id, updateData);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order updated successfully', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. ADMIN: ADD RESTAURANT
app.post('/api/admin/restaurants', async (req, res) => {
  try {
    const newRest = await db.addRestaurant(req.body);
    res.status(201).json({ success: true, data: newRest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. ADMIN: ADD DISH TO RESTAURANT
app.post('/api/admin/dishes', async (req, res) => {
  try {
    const newDish = await db.addDish(req.body);
    res.status(201).json({ success: true, data: newDish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static assets from client build folder (single-port deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, '../client/dist');

app.use(express.static(clientBuildPath));

// Fallback all other client-side routes to React Router index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zomato Clone Express server running on port ${PORT}`);
});
