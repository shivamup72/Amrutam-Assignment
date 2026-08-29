/**
 * Shop Module Main Screen (Styled matching AyurWellness Mockup)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';
import { ProductCard } from './ProductCard';
import { PaginatedFlatList } from '../../components/PaginatedFlatList';
import { ShopProductSkeleton } from '../../components/Skeleton';
import { fetchProducts, resetShopState } from '../../store/slices/shopSlice';

export const ShopScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1200 ? 4 : width >= 768 ? 3 : width >= 540 ? 2 : 2;

  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { products = [], loading, error, hasNextPage = true } = useSelector((state) => state.shop || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allProducts);
  const [sortOption, setSortOption] = useState('recommended');
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const requestLockRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadProductsData = useCallback(async (targetPage: number, reset = false) => {
    if (requestLockRef.current || (targetPage > 1 && !hasNextPage)) return;

    requestLockRef.current = true;
    const currentRequestId = ++requestIdRef.current;

    if ((reset || targetPage === 1) && products.length === 0) {
      setIsInitialLoading(true);
    } else if (targetPage > 1) {
      setIsFetchingMore(true);
    }

    try {
      await dispatch(
        fetchProducts({
          page: targetPage,
          limit: 10,
          search: debouncedSearch,
          category: selectedCategory,
          sortOption,
          reset,
        }) as any
      ).unwrap();

      if (requestIdRef.current === currentRequestId) {
        setPage(targetPage);
      }
    } catch (err) {
      // Error handled in Redux state
    } finally {
      if (requestIdRef.current === currentRequestId) {
        requestLockRef.current = false;
        setIsFetchingMore(false);
        setIsInitialLoading(false);
      }
    }
  }, [dispatch, debouncedSearch, selectedCategory, sortOption, hasNextPage, products.length]);

  useEffect(() => {
    dispatch(resetShopState());
    setPage(1);
    loadProductsData(1, true);
  }, [debouncedSearch, selectedCategory, sortOption]);

  const handleCategorySelect = (cat: string) => {
    if (selectedCategory !== cat) {
      setSelectedCategory(cat);
    }
  };

  const categories = [
    { label: t.allProducts, icon: '🌿' },
    { label: t.herbalOils, icon: '🧴' },
    { label: t.supplements, icon: '🌱' },
    { label: t.teasAndElixirs, icon: '🍵' },
  ];

  const sortOptions = [
    { id: 'recommended', label: `Sort: ${t.defaultSort || 'Recommended'} ▾` },
    { id: 'priceAsc', label: t.priceLowHigh || 'Price: Low to High' },
    { id: 'priceDesc', label: t.priceHighLow || 'Price: High to Low' },
  ];

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
      <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#E2DCD5' }]}>
        <Image
          source={require('../../assest/images/search.png')}
          style={styles.largeSearchIconImage}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={t.searchProductsPlaceholder || 'Search products, oils, teas...'}
          placeholderTextColor="#78716C"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 14, color: '#78716C' }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((catObj) => {
          const isActive = selectedCategory === catObj.label;
          return (
            <TouchableOpacity
              key={catObj.label}
              activeOpacity={0.8}
              style={[
                styles.chip,
                isActive ? styles.chipActive : isDarkMode ? styles.chipInactiveDark : styles.chipInactive,
              ]}
              onPress={() => handleCategorySelect(catObj.label)}
            >
              <Text style={styles.chipIcon}>{catObj.icon}</Text>
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : isDarkMode ? styles.chipTextInactiveDark : styles.chipTextInactive,
                ]}
              >
                {catObj.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortScroll}
      >
        {sortOptions.map((option) => {
          const isActive = sortOption === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              style={[
                styles.sortChip,
                isActive ? styles.sortChipActive : isDarkMode ? styles.sortChipInactiveDark : styles.sortChipInactive,
              ]}
              onPress={() => setSortOption(option.id)}
            >
              <Text style={[styles.sortChipText, isActive && styles.sortChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Section Header: Recommended for you */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          🌱 Recommended for you
        </Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // const renderFooterTrustBadges = () => (
  //   <View style={[styles.trustBadgesContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAF6', borderColor: isDarkMode ? '#334155' : '#EAF2E8' }]}>
  //     <View style={styles.trustItem}>
  //       <Text style={styles.trustIcon}>🛡️</Text>
  //       <View>
  //         <Text style={styles.trustTitle}>100% Natural</Text>
  //         <Text style={styles.trustSub}>Pure & Safe</Text>
  //       </View>
  //     </View>
  //     <View style={styles.trustItem}>
  //       <Text style={styles.trustIcon}>🥣</Text>
  //       <View>
  //         <Text style={styles.trustTitle}>Ayurvedic</Text>
  //         <Text style={styles.trustSub}>Ancient Wisdom</Text>
  //       </View>
  //     </View>
  //     <View style={styles.trustItem}>
  //       <Text style={styles.trustIcon}>🌿</Text>
  //       <View>
  //         <Text style={styles.trustTitle}>No Chemicals</Text>
  //         <Text style={styles.trustSub}>No Side Effects</Text>
  //       </View>
  //     </View>
  //     <View style={styles.trustItem}>
  //       <Text style={styles.trustIcon}>✅</Text>
  //       <View>
  //         <Text style={styles.trustTitle}>Trusted Quality</Text>
  //         <Text style={styles.trustSub}>Lab Tested</Text>
  //       </View>
  //     </View>
  //   </View>
  // );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PaginatedFlatList
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        headerComponent={renderHeader()}
        // footerComponent={renderFooterTrustBadges()}
        isInitialLoading={isInitialLoading && products.length === 0}
        isFetchingMore={isFetchingMore}
        hasMore={hasNextPage}
        emptyMessage="No products found"
        onLoadMore={() => loadProductsData(page + 1, false)}
        onRetry={() => loadProductsData(1, true)}
        renderSkeleton={() => <ShopProductSkeleton />}
        error={error}
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
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
  },
  largeSearchIconImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    fontWeight: '500',
  },
  filterControlBtn: {
    paddingLeft: 8,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  sortScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipActive: {
    backgroundColor: '#E2EBDC',
    borderColor: '#C5D8B5',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAE5DF',
  },
  chipInactiveDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
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
  chipTextInactiveDark: {
    color: '#94A3B8',
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sortChipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE5DF',
  },
  sortChipInactiveDark: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sortChipActive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sortChipText: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  bannerCard: {
    position: 'relative',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 140,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D5B30',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '500',
  },
  exploreBtn: {
    backgroundColor: '#2D5B30',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerImage: {
    width: 100,
    height: 110,
    borderRadius: 14,
    alignSelf: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    backgroundColor: '#2D5B30',
    width: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D5B30',
  },
  trustBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: '45%',
  },
  trustIcon: {
    fontSize: 16,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  trustSub: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '500',
  },
});
