import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';
import { DoctorCard } from './DoctorCard';
import { PaginatedFlatList } from '../../components/PaginatedFlatList';
import { DashboardSkeleton } from '../../components/Skeleton';
import { fetchDoctors, resetDoctorsState } from '../../store/slices/consultationsSlice';

export const ConsultationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 2 : 1;

  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { doctors = [], loading, error, hasNextPage = true } = useSelector((state) => state.consultations || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allDoctors);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const requestLockRef = useRef(false);
  const requestIdRef = useRef(0);

  // Debounce search query input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Main data fetching function
  const loadDoctorsData = useCallback(async (targetPage: number, reset = false) => {
    if (requestLockRef.current || (targetPage > 1 && !hasNextPage)) return;

    requestLockRef.current = true;
    const currentRequestId = ++requestIdRef.current;

    if ((reset || targetPage === 1) && doctors.length === 0) {
      setIsInitialLoading(true);
    } else if (targetPage > 1) {
      setIsFetchingMore(true);
    }

    try {
      await dispatch(
        fetchDoctors({
          page: targetPage,
          limit: 10,
          search: debouncedSearch,
          category: selectedCategory,
          reset,
        }) as any
      ).unwrap();

      if (requestIdRef.current === currentRequestId) {
        setPage(targetPage);
      }
    } catch (err) {
      // Error handled by Redux state
    } finally {
      if (requestIdRef.current === currentRequestId) {
        requestLockRef.current = false;
        setIsFetchingMore(false);
        setIsInitialLoading(false);
      }
    }
  }, [dispatch, debouncedSearch, selectedCategory, hasNextPage, doctors.length]);

  // Reset and fetch page 1 when filter or debounced search changes
  useEffect(() => {
    dispatch(resetDoctorsState());
    setPage(1);
    loadDoctorsData(1, true);
  }, [debouncedSearch, selectedCategory]);

  const handleCategorySelect = (cat: string) => {
    if (selectedCategory !== cat) {
      setSelectedCategory(cat);
    }
  };

  const categories = [t.allDoctors, t.ayurveda, t.yoga, t.dietNutrition, t.panchakarma];

  const renderDoctorItem = useCallback(
    ({ item }) => (
      <View style={numColumns > 1 ? { flex: 1, paddingHorizontal: 6 } : undefined}>
        <DoctorCard
          doctor={item}
          onSelect={(doc) => navigation.navigate('DoctorDetail', { doctor: doc })}
        />
      </View>
    ),
    [navigation, numColumns]
  );

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Search Input matching Mockup Image 2 */}
      <View style={styles.searchBox}>
        <Image source={require('../../assest/images/search.png')} style={styles.searchIconImage} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchDoctorsPlaceholder || 'Search doctors, specialties...'}
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

      {/* Category Chips matching Mockup Image 2 */}
      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
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
              onPress={() => handleCategorySelect(cat)}
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

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.availableSpecialists}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PaginatedFlatList
        data={doctors}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctorItem}
        headerComponent={renderHeader()}
        isInitialLoading={isInitialLoading && doctors.length === 0}
        isFetchingMore={isFetchingMore}
        hasMore={hasNextPage}
        emptyMessage="No consultation found"
        onLoadMore={() => loadDoctorsData(page + 1, false)}
        onRetry={() => loadDoctorsData(1, true)}
        renderSkeleton={() => <DashboardSkeleton />}
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
    paddingBottom: 6,
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
  searchIconImage: {
    width: 24,
    height: 24,
    marginRight: 10,
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
    paddingBottom: 14,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});
