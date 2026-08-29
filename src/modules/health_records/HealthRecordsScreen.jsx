/**
 * Health Records Dashboard Screen (Virtualized Grid with Infinite Scroll & Grouping)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';
import { RecordCard } from './RecordCard';
import { VirtualizedGrid } from '../../components/VirtualizedGrid';
import { AttachmentViewerModal } from '../../components/AttachmentViewerModal';
import { fetchHealthRecords } from '../../store/slices/healthRecordsSlice';

export const HealthRecordsScreen = () => {
  const dispatch = useDispatch();
  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { healthRecords = [], loading, error } = useSelector((state) => state.healthRecords || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Records');
  const [previewRecord, setPreviewRecord] = useState(null);

  const categories = ['All Records', 'Lab Report', 'Prescription', 'Consultation', 'Vaccination', 'Allergy'];

  const filteredRecords = useMemo(() => {
    let result = healthRecords;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.doctorName?.toLowerCase().includes(q) ||
          r.type?.toLowerCase().includes(q) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All Records') {
      result = result.filter((r) => r.type === selectedCategory);
    }

    // Sort latest record at top (date descending)
    return [...result].sort((a, b) => b.date.localeCompare(a.date));
  }, [healthRecords, searchQuery, selectedCategory]);

  const renderRecordItem = useCallback(
    ({ item, index }) => {
      const prevItem = index > 0 ? filteredRecords[index - 1] : null;
      const isNewMonth = !prevItem || prevItem.monthYear !== item.monthYear;

      return (
        <View style={styles.recordWrapper}>
          {isNewMonth ? (
            <Text style={[styles.monthHeader, { color: colors.textPrimary }]}>
              {item.monthYear || 'October 2024'}
            </Text>
          ) : null}
          <RecordCard record={item} onPreviewAttachment={setPreviewRecord} />
        </View>
      );
    },
    [filteredRecords, colors]
  );

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Health Records</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
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
              onPress={() => setSelectedCategory(cat)}
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
      <VirtualizedGrid
        data={filteredRecords}
        numColumns={1}
        pageSize={24}
        keyExtractor={(item) => item.id}
        renderItem={renderRecordItem}
        headerComponent={renderHeader()}
        emptyMessage="No health records found"
        error={error}
        refreshing={loading === 'pending'}
        onRefresh={() => dispatch(fetchHealthRecords({ useCache: false }))}
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
