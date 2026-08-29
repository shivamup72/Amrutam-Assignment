import { store } from '../store';
import { bookConsultationSlot, fetchDoctors } from '../store/slices/consultationsSlice';
import {
  addToCart,
  updateCartQuantity,
  toggleWishlist,
} from '../store/slices/shopSlice';
import { setOffline, toggleDarkMode } from '../store/slices/devSlice';
import { translations } from '../core/i18n/i18n';
import { generateDoctors, generateProducts, generateHealthRecords } from '../data/mockGenerator';
import { ApiClient } from '../core/api/apiClient';

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

  test('provides Hindi translations for shared app labels', () => {
    expect(translations.hi.profileSettings).toBe('प्रोफ़ाइल और सेटिंग्स');
    expect(translations.hi.myActivity).toBe('मेरी गतिविधि');
    expect(translations.hi.appLanguage).toBe('ऐप भाषा');
    expect(translations.hi.darkMode).toBe('डार्क मोड');
    expect(translations.hi.biometricLock).toBe('बायोमेट्रिक लॉक');
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

  test('books consultation slot in consultations slice', async () => {
    await store.dispatch(fetchDoctors({ page: 1, limit: 10 }));
    let state = store.getState();
    const firstDoctor = state.consultations.doctors[0];
    const firstSlot = firstDoctor.slots[0];

    store.dispatch(
      bookConsultationSlot({
        doctorId: firstDoctor.id,
        slotId: firstSlot.id,
        isOffline: false,
      }),
    );

    state = store.getState();
    expect(state.consultations.upcomingBookings.length).toBe(1);
    expect(state.consultations.upcomingBookings[0].doctorId).toBe(
      firstDoctor.id,
    );
  });

  test('appends exactly ten doctors when the next page is fetched', async () => {
    await store.dispatch(fetchDoctors({ page: 1, limit: 10 }));
    await store.dispatch(fetchDoctors({ page: 2, limit: 10 }));
    expect(store.getState().consultations.doctors).toHaveLength(20);
    expect(store.getState().consultations.doctors[10].id).toBe('doc_11');
  });

  test('generates stable datasets with the expected item shapes', () => {
    expect(generateDoctors(3)).toHaveLength(3);
    expect(generateDoctors(3)[0]).toEqual(expect.objectContaining({ id: expect.any(String), slots: expect.any(Array) }));
    expect(generateProducts(3)[0]).toEqual(expect.objectContaining({ id: expect.any(String), benefits: expect.any(Array) }));
    expect(generateHealthRecords(2)).toHaveLength(6);
  });

  test('returns cached API data when offline', async () => {
    const client = new ApiClient();
    const onlineResponse = await client.request('test', () => [{ id: 'cached' }], { timeoutMs: 1000 });
    client.isOffline = true;

    const offlineResponse = await client.request('test', () => [], { timeoutMs: 1000 });

    expect(onlineResponse.isCached).toBe(false);
    expect(offlineResponse.isCached).toBe(true);
    expect(offlineResponse.data).toEqual([{ id: 'cached' }]);
  });
});
