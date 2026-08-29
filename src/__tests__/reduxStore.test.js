/**
 * Redux Store & Slices Integration Tests (Pure JavaScript)
 */

import { store } from '../store';
import { bookConsultationSlot } from '../store/slices/consultationsSlice';
import { addToCart, updateCartQuantity, toggleWishlist } from '../store/slices/shopSlice';
import { setOffline, toggleDarkMode } from '../store/slices/devSlice';

describe('Redux Toolkit State Management', () => {
  test('handles dark mode and offline state toggles', () => {
    let state = store.getState();
    expect(state.dev.isDarkMode).toBe(false);

    store.dispatch(toggleDarkMode());
    state = store.getState();
    expect(state.dev.isDarkMode).toBe(true);

    store.dispatch(setOffline(true));
    state = store.getState();
    expect(state.dev.isOffline).toBe(true);
  });

  test('adds product to cart and updates quantity in shop slice', () => {
    const mockProduct = {
      id: 'prod_test_1',
      title: 'Amrutam Kuntal Care Hair Oil',
      category: 'Hair Care',
      price: 499,
      originalPrice: 650,
      rating: 4.8,
      reviewsCount: 120,
    };

    store.dispatch(addToCart({ product: mockProduct, isOffline: false }));
    let state = store.getState();
    expect(state.shop.cart.length).toBe(1);
    expect(state.shop.cart[0].quantity).toBe(1);

    store.dispatch(updateCartQuantity({ productId: 'prod_test_1', delta: 1 }));
    state = store.getState();
    expect(state.shop.cart[0].quantity).toBe(2);
  });

  test('toggles wishlist item in shop slice', () => {
    store.dispatch(toggleWishlist('prod_test_1'));
    let state = store.getState();
    expect(state.shop.wishlistIds).toContain('prod_test_1');

    store.dispatch(toggleWishlist('prod_test_1'));
    state = store.getState();
    expect(state.shop.wishlistIds).not.toContain('prod_test_1');
  });

  test('books consultation slot in consultations slice', () => {
    let state = store.getState();
    const firstDoctor = state.consultations.doctors[0];
    const firstSlot = firstDoctor.slots[0];

    store.dispatch(
      bookConsultationSlot({
        doctorId: firstDoctor.id,
        slotId: firstSlot.id,
        isOffline: false,
      })
    );

    state = store.getState();
    expect(state.consultations.upcomingBookings.length).toBe(1);
    expect(state.consultations.upcomingBookings[0].doctorId).toBe(firstDoctor.id);
  });
});
