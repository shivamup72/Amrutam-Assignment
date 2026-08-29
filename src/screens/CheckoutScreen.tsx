/**
 * Checkout Screen (React Navigation Stack Screen)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder } from '../store/slices/shopSlice';
import { addToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';

export const CheckoutScreen = ({ route, navigation }) => {
  const { totalAmount = 0 } = route.params || {};
  const dispatch = useDispatch();
  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev);
  const { cart } = useSelector((state) => state.shop);

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  const handlePlaceOrder = () => {
    dispatch(placeOrder({ totalAmount, isOffline }));

    if (isOffline) {
      dispatch(addToast({ type: 'info', title: 'Offline Order Queued', message: t.orderQueuedOffline }));
    } else {
      dispatch(addToast({ type: 'success', title: t.orderSuccess, message: `Total Amount: ₹${totalAmount}` }));
    }
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>← {t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.checkout}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.body}>
        <View style={[styles.box, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.boxTitle, { color: colors.textPrimary }]}>{t.orderSummary}</Text>
          <Text style={[styles.boxSub, { color: colors.textSecondary }]}>
            {cart.length} unique Ayurvedic products ({cart.reduce((s, i) => s + i.quantity, 0)} items)
          </Text>

          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>{t.deliveryAddress}</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {t.registeredHome}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>{t.paymentMethod}</Text>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              {t.paymentOptions}
            </Text>
          </View>

          <View style={[styles.row, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#CBD5E1' }]}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
              {t.finalAmount}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>
              ₹{totalAmount}
            </Text>
          </View>
        </View>

        {isOffline ? (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineNoticeText}>
              {t.offlineCheckoutNotice}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.placeBtn, { backgroundColor: colors.primary }]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeBtnText}>{t.placeOrder}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    transform: [{ translateY: -2 }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  box: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  boxSub: {
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offlineNotice: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  offlineNoticeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  placeBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  placeBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});
