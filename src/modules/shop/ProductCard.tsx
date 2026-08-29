/**
 * Shop Product Card Component (Styled matching AyurWellness Mockups)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../../store/slices/shopSlice';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';

export const ProductCard = memo(({ product, onSelect }) => {
  const dispatch = useDispatch();
  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { wishlistIds = [] } = useSelector((state) => state.shop || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const isWishlisted = (wishlistIds || []).includes(product.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSelect(product)}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: isDarkMode ? '#334155' : '#EAE5DF',
        },
      ]}
    >
      {/* Top Image Container with Floating Heart Button */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.wishlistBtn}
          onPress={(e) => {
            e.stopPropagation();
            dispatch(toggleWishlist(product.id));
          }}
        >
          <Image
            source={
              isWishlisted
                ? require('../../assest/images/whishlistfullfill.jpg')
                : require('../../assest/images/whishlistOutline.jpeg')
            }
            style={styles.wishlistIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Content matching Mockup Image */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {product.category || 'Hair Care'}
        </Text>
        <Text style={[styles.price, { color: colors.textPrimary }]}>
          ${product.price ? product.price.toFixed(2) : '339.00'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  wishlistIconImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    minHeight: 36,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D5B30',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
});
