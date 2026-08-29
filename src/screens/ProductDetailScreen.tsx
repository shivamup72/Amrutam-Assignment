import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addToCart } from '../store/slices/shopSlice';
import { addToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params || {};
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev);
  const { cart } = useSelector((state) => state.shop);

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>{t.productNotFound}</Text>
      </View>
    );
  }

  const inCartItem = cart.find((item) => item.product.id === product.id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>← {t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{product.category}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />

        <Text style={[styles.title, { color: colors.textPrimary }]}>{product.title}</Text>
        <Text style={[styles.formText, { color: colors.textMuted }]}>
          Dosage Form: {product.dosageForm} • ⭐ {product.rating} ({product.reviewsCount} reviews)
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.textPrimary }]}>₹{product.price}</Text>
          {product.originalPrice > product.price ? (
            <Text style={[styles.origPrice, { color: colors.textMuted }]}>
              ₹{product.originalPrice}
            </Text>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.description}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {product.description}
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.keyBenefits}</Text>
        {product.benefits.map((benefit, idx) => (
          <Text key={idx} style={[styles.benefitItem, { color: colors.primary }]}>
            🌿 {benefit}
          </Text>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.surfaceBorder,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            dispatch(addToCart({ product, isOffline }));
            dispatch(addToast({ type: 'success', title: t.addedToCart, message: product.title }));
            navigation.goBack();
          }}
        >
          <Text style={styles.addBtnText}>
            {inCartItem ? `${t.addToCart} (${inCartItem.quantity})` : t.addToCart}
          </Text>
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
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  bodyContent: {
    paddingBottom: 12,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  formText: {
    fontSize: 12,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
  },
  origPrice: {
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  benefitItem: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  addBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
