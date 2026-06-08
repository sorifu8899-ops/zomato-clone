import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { initialRestaurants, initialDishes, initialOffers } from './mock_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'db_store.json');

// Initialize local JSON store if it doesn't exist
function initJsonStore() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    const defaultData = {
      restaurants: initialRestaurants,
      dishes: initialDishes,
      offers: initialOffers,
      orders: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}
initJsonStore();

// Read operations for JSON store
function readJsonStore() {
  initJsonStore();
  const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
  return JSON.parse(raw);
}

// Write operations for JSON store
function writeJsonStore(data) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Supabase client configuration
let supabase = null;
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);
};

if (isSupabaseConfigured()) {
  try {
    const activeKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    supabase = createClient(process.env.SUPABASE_URL, activeKey);
    console.log('Supabase client initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.log('Supabase keys not configured. Falling back to local file-based persistence (db_store.json).');
}

// DATABASE INTERFACE
export const db = {
  // GET ALL RESTAURANTS
  async getRestaurants() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('restaurants').select('*').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.error('Supabase getRestaurants error, falling back:', err);
      }
    }
    return readJsonStore().restaurants.filter(r => r.is_active);
  },

  // GET RESTAURANT BY ID
  async getRestaurantById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getRestaurantById error, falling back:', err);
      }
    }
    const store = readJsonStore();
    return store.restaurants.find(r => r.id === id) || null;
  },

  // GET DISHES BY RESTAURANT ID
  async getDishes(restaurantId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('dishes').select('*').eq('restaurant_id', restaurantId).order('name');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.error('Supabase getDishes error, falling back:', err);
      }
    }
    const store = readJsonStore();
    return store.dishes.filter(d => d.restaurant_id === restaurantId && d.is_available);
  },

  // GET ALL OFFERS
  async getOffers() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('offers').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.error('Supabase getOffers error, falling back:', err);
      }
    }
    return readJsonStore().offers.filter(o => o.is_active);
  },

  // GET OFFER BY CODE
  async getOfferByCode(code) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('offers').select('*').eq('code', code.toUpperCase()).single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getOfferByCode error, falling back:', err);
      }
    }
    const store = readJsonStore();
    return store.offers.find(o => o.code.toUpperCase() === code.toUpperCase()) || null;
  },

  // CREATE ORDER
  async createOrder(orderData) {
    const newOrder = {
      id: orderData.id || `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      restaurant_id: orderData.restaurant_id,
      items: orderData.items,
      subtotal: Number(orderData.subtotal),
      discount_applied: Number(orderData.discount_applied || 0),
      delivery_charge: Number(orderData.delivery_charge || 40),
      total_amount: Number(orderData.total_amount),
      delivery_pincode: orderData.delivery_pincode,
      delivery_address: orderData.delivery_address,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_status || 'PENDING',
      order_status: orderData.order_status || 'PLACED',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
        if (!error && data) return data;
        console.error('Supabase createOrder error, inserting locally:', error);
      } catch (err) {
        console.error('Supabase createOrder exception, falling back:', err);
      }
    }

    const store = readJsonStore();
    store.orders.unshift(newOrder); // Add to beginning
    writeJsonStore(store);
    return newOrder;
  },

  // GET ORDER BY ID
  async getOrderById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getOrderById error, falling back:', err);
      }
    }
    const store = readJsonStore();
    return store.orders.find(o => o.id === id) || null;
  },

  // GET ALL ORDERS FOR ADMIN
  async getAllOrders() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getAllOrders error, falling back:', err);
      }
    }
    return readJsonStore().orders;
  },

  // UPDATE ORDER STATUS
  async updateOrderStatus(orderId, statusData) {
    // statusData can contain { order_status, payment_status }
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').update(statusData).eq('id', orderId).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase updateOrderStatus error, falling back:', err);
      }
    }

    const store = readJsonStore();
    const orderIndex = store.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      store.orders[orderIndex] = {
        ...store.orders[orderIndex],
        ...statusData
      };
      writeJsonStore(store);
      return store.orders[orderIndex];
    }
    return null;
  },

  // GET ADMIN ANALYTICS STATS
  async getAdminStats() {
    let orders = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('orders').select('*');
        if (!error && data) orders = data;
      } catch (err) {
        console.error('Supabase getAdminStats error, falling back:', err);
      }
    }

    if (orders.length === 0) {
      orders = readJsonStore().orders;
    }

    const totalSales = orders.filter(o => o.payment_status === 'PAID' && o.order_status !== 'CANCELLED')
                            .reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? (totalSales / orders.filter(o => o.payment_status === 'PAID' && o.order_status !== 'CANCELLED').length || totalSales / totalOrders) : 0;
    
    // Get unique active pincodes
    const pincodesSet = new Set(orders.map(o => o.delivery_pincode));
    const activePincodes = pincodesSet.size;

    // Order status breakdown
    const statusCounts = {
      PLACED: 0,
      PREPARING: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };
    orders.forEach(o => {
      if (statusCounts[o.order_status] !== undefined) {
        statusCounts[o.order_status]++;
      }
    });

    return {
      totalSales: Math.round(totalSales),
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue),
      activePincodes,
      statusCounts
    };
  },

  // ADMIN OPERATIONS: ADD RESTAURANT
  async addRestaurant(restaurant) {
    const newRest = {
      id: `rest-${Date.now()}`,
      name: restaurant.name,
      image_url: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
      cuisines: Array.isArray(restaurant.cuisines) ? restaurant.cuisines : restaurant.cuisines.split(',').map(c => c.trim()),
      rating: 4.0,
      delivery_time: Number(restaurant.delivery_time || 30),
      cost_for_two: Number(restaurant.cost_for_two || 300),
      discount_text: restaurant.discount_text || '10% OFF',
      address: restaurant.address,
      is_active: true
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('restaurants').insert([newRest]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase addRestaurant error, falling back:', err);
      }
    }

    const store = readJsonStore();
    store.restaurants.push(newRest);
    writeJsonStore(store);
    return newRest;
  },

  // ADMIN OPERATIONS: ADD DISH
  async addDish(dish) {
    const newDish = {
      id: `dish-${Date.now()}`,
      restaurant_id: dish.restaurant_id,
      name: dish.name,
      price: Number(dish.price),
      discount_price: dish.discount_price ? Number(dish.discount_price) : null,
      description: dish.description || '',
      image_url: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
      category: dish.category || 'Veg',
      course: dish.course || 'Main Course',
      is_available: true,
      customization_options: dish.customization_options || []
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('dishes').insert([newDish]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase addDish error, falling back:', err);
      }
    }

    const store = readJsonStore();
    store.dishes.push(newDish);
    writeJsonStore(store);
    return newDish;
  }
};
