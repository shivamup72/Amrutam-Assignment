/**
 * Shop Product Card Component (Styled after AyurWellness Mockups)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, toggleWishlist } from '../../store/slices/shopSlice';
import { addToast } from '../../store/slices/devSlice';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';

export const ProductCard = memo(({ product, onSelect }) => {
  const dispatch = useDispatch();
  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev || {});
  const { cart = [], wishlistIds = [] } = useSelector((state) => state.shop || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const isWishlisted = (wishlistIds || []).includes(product.id);
  const inCartItem = (cart || []).find((item) => item.product?.id === product.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSelect(product)}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Top Image Container with Floating Heart Button */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={(e) => {
            e.stopPropagation();
            dispatch(toggleWishlist(product.id));
          }}
        >
          <Text style={{ fontSize: 14 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {product.category || 'Ayurvedic Formula'}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: colors.textPrimary }]}>
            ${product.price ? product.price.toFixed(2) : '28.00'}
          </Text>

          {/* Plus Circle Add Button */}
          <TouchableOpacity
            style={[
              styles.addCircleBtn,
              { backgroundColor: inCartItem ? colors.primaryHover || '#2D5B30' : colors.primary },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              dispatch(addToCart({ product, isOffline }));
              dispatch(addToast({ type: 'success', title: 'Added to Cart', message: product.title }));
            }}
          >
            <Text style={styles.plusText}>{inCartItem ? '✓' : '+'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D5B30',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
});
