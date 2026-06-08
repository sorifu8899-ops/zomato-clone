import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LocationBar from '../components/LocationBar';
import { API_BASE_URL } from '../App';
import { Star, Clock, Heart, Share2, Info, ChevronRight, Check } from 'lucide-react';

function RestaurantDetails({ location, cart, addToCart, updateCartQty }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  
  // Customization Modal State
  const [activeDish, setActiveDish] = useState(null); // Dish currently being customized
  const [selectedChoices, setSelectedChoices] = useState({}); // { 'Size': ChoiceObject, 'Addons': [ChoiceObject, ChoiceObject] }

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/restaurants/${id}`);
      const json = await res.json();
      if (json.success) {
        setRestaurant(json.data);
      }
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <LocationBar location={location} detectLocation={() => {}} updateLocationManually={() => {}} cart={cart} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '150px 0' }}>
          <div className="spinner dark"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div>
        <LocationBar location={location} detectLocation={() => {}} updateLocationManually={() => {}} cart={cart} />
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2>Restaurant not found</h2>
          <button onClick={() => navigate('/')} className="place-order-btn" style={{ maxWidth: '200px', margin: '20px auto' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Group dishes by course
  const courses = ['Recommended', 'Starters', 'Main Course', 'Desserts', 'Beverages'];
  const menuGroups = {};
  
  courses.forEach(course => {
    const filtered = (restaurant.dishes || []).filter(dish => {
      const matchesVeg = vegOnly ? dish.category === 'Veg' : true;
      return dish.course === course && matchesVeg;
    });
    if (filtered.length > 0) {
      menuGroups[course] = filtered;
    }
  });

  // Check if an item is in the cart (returns matching items)
  const getCartItemQty = (dishId) => {
    if (cart.restaurantId !== restaurant.id) return 0;
    // For simple checks, sum quantities of this dish id
    const matched = cart.items.filter(item => item.id === dishId);
    return matched.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Open customization modal or add directly to cart
  const handleAddClick = (dish) => {
    if (dish.customization_options && dish.customization_options.length > 0) {
      setActiveDish(dish);
      
      // Initialize default selections
      const initialSelections = {};
      dish.customization_options.forEach(opt => {
        if (opt.type === 'radio') {
          // Select first radio choice by default
          initialSelections[opt.title] = opt.choices[0];
        } else if (opt.type === 'checkbox') {
          initialSelections[opt.title] = [];
        }
      });
      setSelectedChoices(initialSelections);
    } else {
      // Add directly
      const itemToAdd = {
        id: dish.id,
        name: dish.name,
        price: dish.discount_price || dish.price,
        quantity: 1,
        customizations: [],
        customizationSummary: ''
      };
      addToCart(restaurant.id, restaurant.name, itemToAdd);
    }
  };

  // Handle selections inside modal
  const handleRadioSelect = (optionTitle, choice) => {
    setSelectedChoices(prev => ({
      ...prev,
      [optionTitle]: choice
    }));
  };

  const handleCheckboxToggle = (optionTitle, choice) => {
    setSelectedChoices(prev => {
      const currentList = prev[optionTitle] || [];
      const exists = currentList.find(c => c.name === choice.name);
      let updatedList;
      if (exists) {
        updatedList = currentList.filter(c => c.name !== choice.name);
      } else {
        updatedList = [...currentList, choice];
      }
      return {
        ...prev,
        [optionTitle]: updatedList
      };
    });
  };

  // Submit customizations
  const handleCustomizationSubmit = () => {
    const list = [];
    let extraCost = 0;
    const summaries = [];

    Object.keys(selectedChoices).forEach(title => {
      const selection = selectedChoices[title];
      if (Array.isArray(selection)) {
        // Multi select checkboxes
        selection.forEach(choice => {
          list.push({ title, choiceName: choice.name, extraPrice: choice.extra_price });
          extraCost += choice.extra_price;
          summaries.push(choice.name);
        });
      } else if (selection) {
        // Radio buttons
        list.push({ title, choiceName: selection.name, extraPrice: selection.extra_price });
        extraCost += selection.extra_price;
        summaries.push(selection.name);
      }
    });

    const finalUnitPrice = (activeDish.discount_price || activeDish.price) + extraCost;

    const itemToAdd = {
      id: activeDish.id,
      name: activeDish.name,
      price: finalUnitPrice,
      quantity: 1,
      customizations: list,
      customizationSummary: summaries.join(', ')
    };

    addToCart(restaurant.id, restaurant.name, itemToAdd);
    setActiveDish(null);
  };

  // Calculate customized total price in modal footer
  const calculateModalTotal = () => {
    if (!activeDish) return 0;
    let total = activeDish.discount_price || activeDish.price;
    Object.keys(selectedChoices).forEach(title => {
      const selection = selectedChoices[title];
      if (Array.isArray(selection)) {
        selection.forEach(c => { total += c.extra_price; });
      } else if (selection) {
        total += selection.extra_price;
      }
    });
    return total;
  };

  return (
    <div className="anim-fade" style={{ background: '#fcfcfc' }}>
      <LocationBar location={location} detectLocation={() => {}} updateLocationManually={() => {}} cart={cart} />

      {/* Header Info */}
      <section className="restaurant-header-bg">
        <div className="container">
          <div className="restaurant-gallery">
            <div className="gallery-main">
              <img src={restaurant.image_url} alt={restaurant.name} />
            </div>
            <div className="gallery-side" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60" alt="Restaurant interior" />
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60" alt="Food dish cooking" />
            </div>
          </div>

          <div className="restaurant-header-info">
            <div>
              <h1 className="restaurant-title">{restaurant.name}</h1>
              <p className="restaurant-cuisines">{restaurant.cuisines.join(', ')}</p>
              <p className="restaurant-address">{restaurant.address}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
                <span>Opens at 11:00 AM • Delivery in {restaurant.delivery_time} mins to <strong>{location.pincode}</strong></span>
              </p>
            </div>

            <div className="ratings-container">
              <div className="rating-box">
                <div className="rating-score">
                  <span>{restaurant.rating}</span>
                  <Star size={16} fill="var(--white)" />
                </div>
                <div className="rating-details">
                  <strong style={{ display: 'block' }}>1.2k</strong>
                  <span>Dining Reviews</span>
                </div>
              </div>
              <div className="rating-box">
                <div className="rating-score" style={{ background: '#4f5e74' }}>
                  <span>4.3</span>
                  <Star size={16} fill="var(--white)" />
                </div>
                <div className="rating-details">
                  <strong style={{ display: 'block' }}>10.5k</strong>
                  <span>Delivery Ratings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Sections container */}
      <section className="container restaurant-menu-section">
        
        {/* Sidebar anchor categories */}
        <aside className="menu-sidebar">
          <h3 className="sidebar-title">Menu Sections</h3>
          {Object.keys(menuGroups).map((course, idx) => (
            <a href={`#${course.replace(/\s+/g, '-')}`} key={idx} className="sidebar-item" style={{ display: 'block' }}>
              {course} ({menuGroups[course].length})
            </a>
          ))}

          {/* Veg Only Switch */}
          <div className="filter-switch">
            <label className="switch">
              <input 
                type="checkbox" 
                checked={vegOnly} 
                onChange={() => setVegOnly(!vegOnly)} 
              />
              <span className="slider"></span>
            </label>
            <span>Veg only</span>
          </div>

          <div style={{ marginTop: '30px', padding: '16px', background: 'var(--primary-light)', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
            <h5 style={{ color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={14} /> Active Promo</h5>
            <p style={{ fontSize: '12px', color: 'var(--text-dark)' }}>Apply coupon <strong>ZOMATO50</strong> on checkout for up to ₹100 off!</p>
          </div>
        </aside>

        {/* Menu Dishes */}
        <div className="menu-dishes anim-slide">
          {Object.keys(menuGroups).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
              <h3>No items available</h3>
              <p>Try toggling off the Veg only filter.</p>
            </div>
          ) : (
            Object.keys(menuGroups).map((course) => (
              <div key={course} id={course.replace(/\s+/g, '-')} className="dish-category-group">
                <h3 className="dish-category-name">{course}</h3>

                {menuGroups[course].map((dish) => {
                  const cartQty = getCartItemQty(dish.id);
                  return (
                    <div key={dish.id} className="dish-card">
                      <div className="dish-info">
                        <div className={`dish-veg-tag ${dish.category === 'Veg' ? 'veg' : 'non-veg'}`}></div>
                        <h4 className="dish-name">{dish.name}</h4>
                        
                        <div className="dish-price-row">
                          <span className="dish-price">₹{dish.discount_price || dish.price}</span>
                          {dish.discount_price && (
                            <span className="dish-original-price">₹{dish.price}</span>
                          )}
                        </div>

                        <p className="dish-desc">{dish.description}</p>
                      </div>

                      <div className="dish-action">
                        {dish.image_url && (
                          <div className="dish-image">
                            <img src={dish.image_url} alt={dish.name} />
                          </div>
                        )}
                        
                        <div style={{ marginTop: dish.image_url ? '10px' : '0px' }}>
                          {cartQty > 0 ? (
                            <div className="qty-btn">
                              {/* Simple cart modifier (grabs first item of this dish type for simplicity) */}
                              <button onClick={() => {
                                const matchedItem = cart.items.find(i => i.id === dish.id);
                                if (matchedItem) updateCartQty(dish.id, matchedItem.customizations, -1);
                              }}>-</button>
                              <span>{cartQty}</span>
                              <button onClick={() => {
                                const matchedItem = cart.items.find(i => i.id === dish.id);
                                if (matchedItem) updateCartQty(dish.id, matchedItem.customizations, 1);
                              }}>+</button>
                            </div>
                          ) : (
                            <button className="add-btn" onClick={() => handleAddClick(dish)}>
                              Add
                            </button>
                          )}
                        </div>

                        {dish.customization_options && dish.customization_options.length > 0 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>Customizable</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Customization Modal */}
      {activeDish && (
        <div className="modal-overlay" onClick={() => setActiveDish(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customize {activeDish.name}</h3>
              <button onClick={() => setActiveDish(null)} style={{ fontSize: '22px', fontWeight: 'bold' }}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="modal-dish-info">
                <h4 className="modal-dish-name">₹{activeDish.discount_price || activeDish.price}</h4>
                <p className="modal-dish-desc">{activeDish.description}</p>
              </div>

              {activeDish.customization_options.map((opt, secIdx) => (
                <div key={secIdx} className="customization-section">
                  <div className="customization-sec-title">
                    <span>{opt.title}</span>
                    {opt.required && <span className="req">Required</span>}
                  </div>

                  <div className="choices-list">
                    {opt.choices.map((choice, choiceIdx) => {
                      const isRadio = opt.type === 'radio';
                      const isChecked = isRadio 
                        ? selectedChoices[opt.title]?.name === choice.name
                        : (selectedChoices[opt.title] || []).some(c => c.name === choice.name);

                      return (
                        <div 
                          key={choiceIdx} 
                          className="choice-row"
                          onClick={() => isRadio ? handleRadioSelect(opt.title, choice) : handleCheckboxToggle(opt.title, choice)}
                        >
                          <div className="choice-label-wrapper">
                            <input 
                              type={opt.type} 
                              name={opt.title}
                              checked={isChecked}
                              readOnly
                              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                            />
                            <span>{choice.name}</span>
                          </div>
                          {choice.extra_price > 0 && (
                            <span className="choice-price">+₹{choice.extra_price}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>Total Price</span>
                <span className="modal-total-price">₹{calculateModalTotal()}</span>
              </div>
              <button className="modal-add-to-cart-btn" onClick={handleCustomizationSubmit}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetails;
