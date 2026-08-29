/**
 * Shop & Cart Redux Slice with Redux Toolkit Async Thunks
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateProducts } from '../../data/mockGenerator';
import { apiClient } from '../../core/api/apiClient';
import { offlineEngine } from '../../core/offline/offlineEngine';
import { localStorage, STORAGE_KEYS } from '../../storage/storage';

export const fetchProducts = createAsyncThunk(
  'shop/fetchProducts',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(
        'products',
        () => generateProducts(20000),
        options,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch products');
    }
  },
);

const initialState = {
  products: generateProducts(20000),
  cart: [],
  wishlistIds: [],
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, isOffline } = action.payload;
      const existing = state.cart.find(item => item.product.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ product, quantity: 1 });
      }

      if (isOffline) {
        offlineEngine.enqueue('SYNC_CART', {
          productId: product.id,
          action: 'ADD',
        });
      }
    },
    updateCartQuantity: (state, action) => {
      const { productId, delta } = action.payload;
      const existing = state.cart.find(item => item.product.id === productId);
      if (existing) {
        existing.quantity += delta;
        if (existing.quantity <= 0) {
          state.cart = state.cart.filter(item => item.product.id !== productId);
        }
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(
        item => item.product.id !== action.payload,
      );
    },
    toggleWishlist: (state, action) => {
      const productId = action.payload;
      if (state.wishlistIds.includes(productId)) {
        state.wishlistIds = state.wishlistIds.filter(id => id !== productId);
      } else {
        state.wishlistIds.push(productId);
      }
    },
    clearCart: state => {
      state.cart = [];
    },
    placeOrder: (state, action) => {
      const { totalAmount, isOffline } = action.payload;
      if (isOffline) {
        offlineEngine.enqueue('PLACE_ORDER', {
          cart: state.cart,
          totalAmount,
          orderedAt: new Date().toISOString(),
        });
      }
      state.cart = [];
    },
    setCart: (state, action) => {
      state.cart = action.payload;
    },
    setWishlist: (state, action) => {
      state.wishlistIds = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

const persistShopState = state => {
  localStorage.setItem(STORAGE_KEYS.CART, state.cart);
  localStorage.setItem(STORAGE_KEYS.WISHLIST, state.wishlistIds);
};

const shopReducer = (state, action) => {
  const nextState = shopSlice.reducer(state, action);
  if (
    [
      'shop/addToCart',
      'shop/updateCartQuantity',
      'shop/removeFromCart',
      'shop/toggleWishlist',
      'shop/clearCart',
      'shop/placeOrder',
      'shop/setCart',
      'shop/setWishlist',
    ].includes(action.type)
  ) {
    persistShopState(nextState);
  }
  return nextState;
};

export const {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  toggleWishlist,
  clearCart,
  placeOrder,
  setCart,
  setWishlist,
} = shopSlice.actions;

export default shopReducer;
