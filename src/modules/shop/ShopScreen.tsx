/**
 * Shop Module Main Screen (Styled matching AyurWellness Mockups)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';
import { ProductCard } from './ProductCard';
import { VirtualizedGrid } from '../../components/VirtualizedGrid';
import { fetchProducts } from '../../store/slices/shopSlice';

export const ShopScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1200 ? 4 : width >= 768 ? 3 : width >= 540 ? 2 : 2;

  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { products = [], loading, error } = useSelector((state) => state.shop || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allProducts);
  const [sortOption, setSortOption] = useState('recommended');

  const categories = [t.allProducts, t.herbalOils, t.supplements, t.teasAndElixirs, t.digestive];
  const sortOptions = [
    { id: 'recommended', label: t.defaultSort },
    { id: 'priceAsc', label: t.priceLowHigh },
    { id: 'priceDesc', label: t.priceHighLow },
    { id: 'ratingDesc', label: t.ratingHighLow },
  ];

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== t.allProducts) {
      result = result.filter((p) =>
        p.category?.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])
      );
    }

    return [...result].sort((first, second) => {
      if (sortOption === 'priceAsc') return first.price - second.price;
      if (sortOption === 'priceDesc') return second.price - first.price;
      if (sortOption === 'ratingDesc') return second.rating - first.rating;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, sortOption]);

  const renderProductItem = useCallback(
    ({ item }) => (
      <View style={{ flex: 1, paddingHorizontal: 6 }}>
        <ProductCard
          product={item}
          onSelect={(prod) => navigation.navigate('ProductDetail', { product: prod })}
        />
      </View>
    ),
    [navigation]
  );

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Search Input matching Mockup Image 1 */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchProductsPlaceholder || 'Search products, oils, teas...'}
          placeholderTextColor="#78716C"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ fontSize: 14, color: '#78716C' }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Horizontal Category Chips matching Mockup Image 1 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.8}
            style={[styles.sortChip, sortOption === option.id && styles.sortChipActive]}
            onPress={() => setSortOption(option.id)}
          >
            <Text style={styles.sortChipText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <VirtualizedGrid
        data={filteredProducts}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        headerComponent={renderHeader()}
        emptyMessage={t.noProductsFound || 'No products found'}
        error={error}
        refreshing={loading === 'pending'}
        onRefresh={() => dispatch(fetchProducts({ useCache: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerArea: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: '#ECE7E1',
    borderWidth: 1,
    borderColor: '#E2DCD5',
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#78716C',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1917',
    padding: 0,
    fontWeight: '500',
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#C5D8B5',
  },
  chipInactive: {
    backgroundColor: '#EBF0F8',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#2D5B30',
  },
  chipTextInactive: {
    color: '#475569',
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sortChipActive: {
    backgroundColor: '#DDEBD6',
    borderColor: '#8FB58A',
  },
  sortChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
});
