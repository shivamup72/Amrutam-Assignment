/**
 * Wishlist Screen (React Navigation Stack Screen)
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, toggleWishlist } from '../store/slices/shopSlice';
import { addToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';
import { VirtualizedGrid } from '../components/VirtualizedGrid';

export const WishlistScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev);
  const { products, wishlistIds } = useSelector((state) => state.shop);

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const renderWishlistItem = useCallback(({ item: product }) => (
    <View style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Image source={{ uri: product.imageUrl }} style={styles.itemImg} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>{product.title}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{product.price}</Text>
      </View>
      <TouchableOpacity
        style={[styles.moveBtn, { backgroundColor: colors.primary }]}
        onPress={() => {
          dispatch(addToCart({ product, isOffline }));
          dispatch(toggleWishlist(product.id));
          dispatch(addToast({ type: 'success', title: t.moveToCart, message: product.title }));
        }}
      >
        <Text style={styles.moveBtnText}>{t.moveToCart}</Text>
      </TouchableOpacity>
    </View>
  ), [colors, dispatch, isOffline, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>← {t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          ❤️ {t.wishlist} ({wishlistedProducts.length})
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <VirtualizedGrid
        data={wishlistedProducts}
        pageSize={20}
        keyExtractor={(item) => item.id}
        renderItem={renderWishlistItem}
        emptyMessage={t.noWishlistItems}
      />
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
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  itemCard: {
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
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  moveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  moveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
