/**
 * Shop & Cart Redux Slice with Redux Toolkit Async Thunks
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFilteredProducts } from '../../data/mockGenerator';
import { apiClient } from '../../core/api/apiClient';
import { offlineEngine } from '../../core/offline/offlineEngine';
import { localStorage, STORAGE_KEYS } from '../../storage/storage';

export const fetchProducts = createAsyncThunk(
  'shop/fetchProducts',
  async (options = {}, { rejectWithValue }) => {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const search = options.search || '';
      const category = options.category || '';
      const sortOption = options.sortOption || 'recommended';
      const response = await apiClient.request(
        `products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&sort=${sortOption}`,
        () => fetchFilteredProducts({ page, limit, search, category, sortOption }),
        options,
      );
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || page,
        limit: response.data.limit || limit,
        totalPages: response.data.totalPages || 0,
        hasNextPage: !!response.data.hasNextPage,
        reset: !!options.reset || page === 1,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch products');
    }
  },
);

const initialState = {
  products: [],
  cart: [],
  wishlistIds: [],
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
  hasNextPage: true,
  page: 1,
  total: 0,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    resetShopState: (state) => {
      state.products = [];
      state.loading = 'idle';
      state.error = null;
      state.hasNextPage = true;
      state.page = 1;
      state.total = 0;
    },
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
        const newProducts = action.payload.data || [];
        if (action.payload.reset || action.payload.page === 1) {
          state.products = newProducts;
        } else {
          const existingIds = new Set(state.products.map(p => p.id));
          const filteredNew = newProducts.filter(p => !existingIds.has(p.id));
          state.products.push(...filteredNew);
        }
        state.hasNextPage = action.payload.hasNextPage;
        state.page = action.payload.page;
        state.total = action.payload.total;
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
  resetShopState,
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
