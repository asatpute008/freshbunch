import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [deliveryPincode, setDeliveryPincode] = useState(() => localStorage.getItem('fb_pincode') || '560001');
  const [deliveryZone, setDeliveryZone] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fb_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('fb_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('fb_coupon');
    }
  }, [appliedCoupon]);

  // Initial check of default pincode
  useEffect(() => {
    if (deliveryPincode) {
      checkPincode(deliveryPincode);
    }
  }, []);

  const checkPincode = async (pincode) => {
    try {
      const res = await fetch(`/api/delivery/check-pincode/${pincode.trim()}`);
      const data = await res.json();
      if (data.success && data.serviceable) {
        setDeliveryZone(data);
        setDeliveryPincode(pincode.trim());
        localStorage.setItem('fb_pincode', pincode.trim());
        return { success: true, message: data.message };
      } else {
        setDeliveryZone(null);
        return { success: false, message: data.message || 'Pincode not serviceable' };
      }
    } catch (err) {
      return { success: false, message: 'Could not verify pincode' };
    }
  };

  // Helper to compute unit price taking into account weight multiplier
  const computeItemUnitPrice = (product, customization = {}) => {
    const basePrice = product.discount_price ? Number(product.discount_price) : Number(product.base_price);
    if (customization.weight) {
      const weightNum = parseFloat(customization.weight);
      if (weightNum > 0.5) {
        const extraWeight = weightNum - 0.5;
        const extraCharge = Math.round(extraWeight * (basePrice * 0.9));
        return basePrice + extraCharge;
      }
    }
    return basePrice;
  };

  const addToCart = (product, quantity = 1, customization = {}, openDrawer = false) => {
    const itemKey = `${product.id}__${JSON.stringify(customization)}`;
    const effectivePrice = computeItemUnitPrice(product, customization);
    const primaryImage = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : (typeof product.images_json === 'string' ? JSON.parse(product.images_json || '[]')[0] : '');

    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.itemKey === itemKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty > product.stock_qty) {
          alert(`Only ${product.stock_qty} available in stock!`);
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            itemKey,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            image: primaryImage,
            unit_price: effectivePrice,
            stock_qty: product.stock_qty,
            quantity: Math.min(quantity, product.stock_qty),
            customization
          }
        ];
      }
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const getItemQuantity = (productId) => {
    return items
      .filter(i => i.product_id === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const getProductItemKey = (productId) => {
    const item = items.find(i => i.product_id === productId);
    return item ? item.itemKey : null;
  };

  const updateQuantity = (itemKey, delta) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.itemKey === itemKey) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.stock_qty) {
              alert(`Maximum available stock is ${item.stock_qty}`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (itemKey) => {
    setItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('fb_cart');
    localStorage.removeItem('fb_coupon');
  };

  // Subtotal Calculation
  const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  // Apply Coupon
  const applyCoupon = async (code) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Discount computation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  // Delivery charge calculation
  let deliveryCharge = 0;
  if (items.length > 0) {
    const baseZoneCharge = deliveryZone ? deliveryZone.delivery_charge : 49;
    const minFree = deliveryZone ? deliveryZone.min_free_delivery_amount : 599;
    const slotSurcharge = selectedSlot ? Number(selectedSlot.slot_charge) || 0 : 0;

    if (subtotal >= minFree) {
      deliveryCharge = slotSurcharge; // Free standard delivery!
    } else {
      deliveryCharge = baseZoneCharge + slotSurcharge;
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        deliveryCharge,
        totalAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        getItemQuantity,
        getProductItemKey,
        updateQuantity,
        removeFromCart,
        clearCart,
        deliveryPincode,
        deliveryZone,
        checkPincode,
        selectedSlot,
        setSelectedSlot,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
