// Mock database dataset for fallback when Supabase is not configured

export const initialOffers = [
  { code: 'ZOMATO50', description: '50% OFF up to ₹100 on orders above ₹150', discount_percentage: 50, max_discount: 100, min_order_value: 150, is_active: true },
  { code: 'INDIA100', description: 'Flat 30% OFF up to ₹150 on your favorite meals', discount_percentage: 30, max_discount: 150, min_order_value: 200, is_active: true },
  { code: 'WELCOME200', description: 'Flat ₹200 OFF on orders above ₹500', discount_percentage: 40, max_discount: 200, min_order_value: 500, is_active: true },
  { code: 'FREEDEL', 'description': '100% Delivery discount up to ₹40 on orders above ₹199', discount_percentage: 100, max_discount: 40, min_order_value: 199, is_active: true }
];

export const initialRestaurants = [
  {
    id: 'rest-1',
    name: 'Biryani By Kilo',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
    cuisines: ['Biryani', 'Kebab', 'Mughlai', 'North Indian'],
    rating: 4.5,
    delivery_time: 35,
    cost_for_two: 350,
    discount_text: '50% OFF up to ₹100',
    address: 'Connaught Place, New Delhi',
    is_active: true
  },
  {
    id: 'rest-2',
    name: 'Pizza Palace',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
    cuisines: ['Pizza', 'Fast Food', 'Pasta', 'Italian'],
    rating: 4.2,
    delivery_time: 25,
    cost_for_two: 400,
    discount_text: '₹120 OFF on orders above ₹349',
    address: 'Sector 18, Noida',
    is_active: true
  },
  {
    id: 'rest-3',
    name: 'The Sweet Heaven',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
    cuisines: ['Desserts', 'Bakery', 'Ice Cream', 'Shakes'],
    rating: 4.6,
    delivery_time: 15,
    cost_for_two: 200,
    discount_text: '20% OFF on all desserts',
    address: 'Rajouri Garden, West Delhi',
    is_active: true
  },
  {
    id: 'rest-4',
    name: 'Burger Bistro',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
    cuisines: ['Burger', 'Fries', 'Fast Food', 'American'],
    rating: 4.4,
    delivery_time: 20,
    cost_for_two: 250,
    discount_text: 'Flat 10% OFF',
    address: 'Indiranagar, Bengaluru',
    is_active: true
  },
  {
    id: 'rest-5',
    name: 'Wow! Momo',
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=60',
    cuisines: ['Momos', 'Chinese', 'Fast Food', 'Noodles'],
    rating: 4.1,
    delivery_time: 30,
    cost_for_two: 300,
    discount_text: '30% OFF up to ₹75',
    address: 'Park Street, Kolkata',
    is_active: true
  },
  {
    id: 'rest-6',
    name: 'Sagar Ratna',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=60',
    cuisines: ['South Indian', 'Pure Veg', 'North Indian'],
    rating: 4.3,
    delivery_time: 28,
    cost_for_two: 220,
    discount_text: '15% OFF on all Combos',
    address: 'Connaught Place, New Delhi',
    is_active: true
  },
  {
    id: 'rest-7',
    name: 'Punjab Grill',
    image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=60',
    cuisines: ['North Indian', 'Mughlai', 'Kebab'],
    rating: 4.7,
    delivery_time: 40,
    cost_for_two: 800,
    discount_text: '10% OFF on Credit Cards',
    address: 'Aerocity, New Delhi',
    is_active: true
  },
  {
    id: 'rest-8',
    name: 'Waffles & Shakes',
    image_url: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=800&auto=format&fit=crop&q=60',
    cuisines: ['Waffles', 'Desserts', 'Beverages', 'Shakes'],
    rating: 4.5,
    delivery_time: 22,
    cost_for_two: 280,
    discount_text: '₹50 OFF above ₹199',
    address: 'Koramangala, Bengaluru',
    is_active: true
  }
];

export const initialDishes = [
  // rest-1: Biryani By Kilo
  {
    id: 'dish-1-1',
    restaurant_id: 'rest-1',
    name: 'Hyderabadi Chicken Biryani',
    price: 320,
    discount_price: 279,
    description: 'Freshly cooked aromatic basmati rice layered with marinated chicken, cooked in handi.',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
    category: 'Non-Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Portion Size',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Regular (Serves 1-2)', extra_price: 0 },
          { name: 'Double (Serves 2-3)', extra_price: 180 }
        ]
      },
      {
        title: 'Add-ons',
        required: false,
        type: 'checkbox',
        choices: [
          { name: 'Extra Salan', extra_price: 15 },
          { name: 'Raita Cup', extra_price: 25 },
          { name: 'Boiled Egg', extra_price: 20 }
        ]
      }
    ]
  },
  {
    id: 'dish-1-2',
    restaurant_id: 'rest-1',
    name: 'Lucknowi Veg Dum Biryani',
    price: 260,
    discount_price: 229,
    description: 'Fragrant basmati rice cooked with fresh seasonal vegetables and rare spices.',
    image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=60',
    category: 'Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Portion Size',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Regular (Serves 1)', extra_price: 0 },
          { name: 'Double (Serves 2)', extra_price: 130 }
        ]
      },
      {
        title: 'Add-ons',
        required: false,
        type: 'checkbox',
        choices: [
          { name: 'Extra Veg Raita', extra_price: 25 },
          { name: 'Roasted Papad (2 pcs)', extra_price: 20 }
        ]
      }
    ]
  },
  {
    id: 'dish-1-3',
    restaurant_id: 'rest-1',
    name: 'Chicken Seekh Kebab (4 Pcs)',
    price: 299,
    description: 'Juicy, minced chicken skewers grilled to perfection in clay tandoor.',
    image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format&fit=crop&q=60',
    category: 'Non-Veg',
    course: 'Starters',
    is_available: true,
    customization_options: []
  },

  // rest-2: Pizza Palace
  {
    id: 'dish-2-1',
    restaurant_id: 'rest-2',
    name: 'Ultimate Margherita Pizza',
    price: 249,
    discount_price: 199,
    description: 'Classic cheese and tomato pizza topped with rich mozzarella cheese & fresh basil.',
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=60',
    category: 'Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Size',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Personal (6")', extra_price: 0 },
          { name: 'Medium (10")', extra_price: 150 },
          { name: 'Large (12")', extra_price: 260 }
        ]
      },
      {
        title: 'Crust Choice',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Classic Hand Tossed', extra_price: 0 },
          { name: 'Cheese Burst', extra_price: 80 },
          { name: 'Thin Crust', extra_price: 40 }
        ]
      },
      {
        title: 'Toppings',
        required: false,
        type: 'checkbox',
        choices: [
          { name: 'Extra Cheese', extra_price: 50 },
          { name: 'Black Olives', extra_price: 30 },
          { name: 'Jalapenos', extra_price: 30 }
        ]
      }
    ]
  },
  {
    id: 'dish-2-2',
    restaurant_id: 'rest-2',
    name: 'Spicy Double Chicken Feast Pizza',
    price: 399,
    description: 'Fiery chicken chunks, chicken meatballs, jalapeño, red paprika on cheese base.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
    category: 'Non-Veg',
    course: 'Main Course',
    is_available: true,
    customization_options: [
      {
        title: 'Size',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Personal (6")', extra_price: 0 },
          { name: 'Medium (10")', extra_price: 220 },
          { name: 'Large (12")', extra_price: 350 }
        ]
      },
      {
        title: 'Crust',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Classic Hand Tossed', extra_price: 0 },
          { name: 'Cheese Burst', extra_price: 90 }
        ]
      }
    ]
  },

  // rest-3: The Sweet Heaven
  {
    id: 'dish-3-1',
    restaurant_id: 'rest-3',
    name: 'Death by Chocolate Cake Slice',
    price: 149,
    discount_price: 129,
    description: 'Triple layer rich Belgian chocolate cake topped with warm chocolate fudge syrup.',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
    category: 'Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Serving Option',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Chilled', extra_price: 0 },
          { name: 'Warm', extra_price: 0 }
        ]
      },
      {
        title: 'Add Vanilla Icecream Scoop',
        required: false,
        type: 'radio',
        choices: [
          { name: 'Yes', extra_price: 45 }
        ]
      }
    ]
  },
  {
    id: 'dish-3-2',
    restaurant_id: 'rest-3',
    name: 'Red Velvet Pastry',
    price: 119,
    description: 'Soft red velvet sponge layers layered with premium cream cheese frosting.',
    image_url: 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?w=800&auto=format&fit=crop&q=60',
    category: 'Veg',
    course: 'Desserts',
    is_available: true,
    customization_options: []
  },

  // rest-4: Burger Bistro
  {
    id: 'dish-4-1',
    restaurant_id: 'rest-4',
    name: 'Classic Cheese Lava Burger',
    price: 169,
    discount_price: 149,
    description: 'Toasted bun loaded with crisp veg patty, cheese slices, and overflowing hot cheese sauce.',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
    category: 'Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Make it a Meal',
        required: false,
        type: 'checkbox',
        choices: [
          { name: 'Add French Fries (M)', extra_price: 60 },
          { name: 'Add Cold Drink (250ml)', extra_price: 40 }
        ]
      },
      {
        title: 'Extra Cheese',
        required: false,
        type: 'checkbox',
        choices: [
          { name: 'Add Cheese Slice', extra_price: 15 }
        ]
      }
    ]
  },

  // rest-5: Wow! Momo
  {
    id: 'dish-5-1',
    restaurant_id: 'rest-5',
    name: 'Steam Chicken Momos (8 Pcs)',
    price: 180,
    discount_price: 140,
    description: 'Traditional minced chicken momos steamed to perfection. Served with spicy momo chutney.',
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=60',
    category: 'Non-Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Style',
        required: true,
        type: 'radio',
        choices: [
          { name: 'Steamed', extra_price: 0 },
          { name: 'Pan Fried in Schezwan Sauce', extra_price: 30 }
        ]
      }
    ]
  },

  // rest-6: Sagar Ratna
  {
    id: 'dish-6-1',
    restaurant_id: 'rest-6',
    name: 'Masala Dosa Combo',
    price: 190,
    discount_price: 160,
    description: 'Crispy rice crêpe rolled with spiced potato filling. Served with sambar and two chutneys.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=60',
    category: 'Veg',
    course: 'Recommended',
    is_available: true,
    customization_options: [
      {
        title: 'Add Butter',
        required: false,
        type: 'radio',
        choices: [
          { name: 'Extra Butter Dosa', extra_price: 20 }
        ]
      }
    ]
  }
];
