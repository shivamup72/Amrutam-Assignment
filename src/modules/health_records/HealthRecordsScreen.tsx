/**
 * Health Records Dashboard Screen (Virtualized Grid with Infinite Scroll & Grouping)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';
import { RecordCard } from './RecordCard';
import { PaginatedFlatList } from '../../components/PaginatedFlatList';
import { HealthRecordSkeleton } from '../../components/Skeleton';
import { AttachmentViewerModal } from '../../components/AttachmentViewerModal';
import { fetchHealthRecords, resetHealthRecordsState } from '../../store/slices/healthRecordsSlice';

export const HealthRecordsScreen = () => {
  const dispatch = useDispatch();
  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { healthRecords = [], loading, error, hasNextPage = true } = useSelector((state) => state.healthRecords || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allRecords);
  const [previewRecord, setPreviewRecord] = useState(null);
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
  const loadRecordsData = useCallback(async (targetPage: number, reset = false) => {
    if (requestLockRef.current || (targetPage > 1 && !hasNextPage)) return;

    requestLockRef.current = true;
    const currentRequestId = ++requestIdRef.current;

    if ((reset || targetPage === 1) && healthRecords.length === 0) {
      setIsInitialLoading(true);
    } else if (targetPage > 1) {
      setIsFetchingMore(true);
    }

    try {
      await dispatch(
        fetchHealthRecords({
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
      // Error handled in Redux state
    } finally {
      if (requestIdRef.current === currentRequestId) {
        requestLockRef.current = false;
        setIsFetchingMore(false);
        setIsInitialLoading(false);
      }
    }
  }, [dispatch, debouncedSearch, selectedCategory, hasNextPage, healthRecords.length]);

  // Reset and fetch page 1 when filter or debounced search changes
  useEffect(() => {
    dispatch(resetHealthRecordsState());
    setPage(1);
    loadRecordsData(1, true);
  }, [debouncedSearch, selectedCategory]);

  const handleCategorySelect = (cat: string) => {
    if (selectedCategory !== cat) {
      setSelectedCategory(cat);
    }
  };

  const categories = [t.allRecords, t.labReport, t.prescription, t.consultation, t.vaccination, t.allergy];

  const renderRecordItem = useCallback(
    ({ item, index }) => {
      const prevItem = index > 0 ? healthRecords[index - 1] : null;
      const isNewMonth = !prevItem || prevItem.monthYear !== item.monthYear;

      return (
        <View style={styles.recordWrapper}>
          {isNewMonth ? (
            <Text style={[styles.monthHeader, { color: colors.textPrimary }]}>
              {item.monthYear || 'October 2026'}
            </Text>
          ) : null}
          <RecordCard record={item} onPreviewAttachment={setPreviewRecord} />
        </View>
      );
    },
    [healthRecords, colors]
  );

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>{t.healthRecordsTitle}</Text>

      <View style={styles.searchBox}>
        <Image source={require('../../assest/images/search.png')} style={styles.searchIconImage} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchRecords || 'Search reports, prescriptions, doctors...'}
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
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PaginatedFlatList
        data={healthRecords}
        numColumns={1}
        keyExtractor={(item) => item.id}
        renderItem={renderRecordItem}
        headerComponent={renderHeader()}
        isInitialLoading={isInitialLoading && healthRecords.length === 0}
        isFetchingMore={isFetchingMore}
        hasMore={hasNextPage}
        emptyMessage="No health records found"
        onLoadMore={() => loadRecordsData(page + 1, false)}
        onRetry={() => loadRecordsData(1, true)}
        renderSkeleton={() => <HealthRecordSkeleton />}
        error={error}
      />

      <AttachmentViewerModal
        visible={!!previewRecord}
        title={previewRecord?.attachmentTitle || previewRecord?.title}
        type={previewRecord?.attachmentType || 'pdf'}
        url={previewRecord?.attachmentUrl}
        onClose={() => setPreviewRecord(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerArea: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 12,
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
    paddingBottom: 12,
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
  recordWrapper: {
    marginBottom: 2,
  },
  monthHeader: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 10,
    marginTop: 8,
  },
});
