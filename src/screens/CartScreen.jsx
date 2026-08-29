/**
 * Cart Screen (React Navigation Stack Screen)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateCartQuantity } from '../store/slices/shopSlice';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';

export const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isDarkMode, language } = useSelector((state) => state.dev);
  const { cart } = useSelector((state) => state.shop);

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * 0.1);
  const total = Math.max(0, subtotal - discount);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          🛒 {t.cart} ({cart.length})
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.body}>
        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
            <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 16 }}>
              {t.emptyCart}
            </Text>
          </View>
        ) : (
          cart.map(({ product, quantity }) => (
            <View
              key={product.id}
              style={[
                styles.cartItem,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <Image source={{ uri: product.imageUrl }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {product.title}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  ₹{product.price}
                </Text>
              </View>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.badgeBg }]}
                  onPress={() => dispatch(updateCartQuantity({ productId: product.id, delta: -1 }))}
                >
                  <Text style={[styles.qtyBtnText, { color: colors.textPrimary }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.qtyVal, { color: colors.textPrimary }]}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.badgeBg }]}
                  onPress={() => dispatch(updateCartQuantity({ productId: product.id, delta: 1 }))}
                >
                  <Text style={[styles.qtyBtnText, { color: colors.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {cart.length > 0 ? (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.surfaceBorder }]}>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.textSecondary }}>{t.subtotal}</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.success }}>{t.discount} (10%)</Text>
            <Text style={{ color: colors.success, fontWeight: '700' }}>-₹{discount}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>{t.total}</Text>
            <Text style={[styles.totalVal, { color: colors.textPrimary }]}>₹{total}</Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Checkout', { totalAmount: total })}
          >
            <Text style={styles.checkoutBtnText}>{t.checkout}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  itemImg: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
  qtyVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  checkoutBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
