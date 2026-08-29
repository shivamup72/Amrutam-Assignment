/**
 * Consultations Module Main Screen (Styled matching AyurWellness Mockups)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';
import { DoctorCard } from './DoctorCard';
import { VirtualizedGrid } from '../../components/VirtualizedGrid';
import { fetchDoctors } from '../../store/slices/consultationsSlice';

export const ConsultationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 2 : 1;

  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const { doctors = [], loading, error } = useSelector((state) => state.consultations || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allDoctors);

  const categories = [t.allDoctors, t.ayurveda, t.yoga, t.dietNutrition, t.panchakarma];

  const filteredDoctors = useMemo(() => {
    let result = doctors;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q) ||
          d.location?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== t.allDoctors) {
      result = result.filter((d) =>
        d.specialty?.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])
      );
    }

    return result;
  }, [doctors, searchQuery, selectedCategory]);

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
        <Text style={styles.searchIcon}>🔍</Text>
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

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t.availableSpecialists}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <VirtualizedGrid
        data={filteredDoctors}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctorItem}
        headerComponent={renderHeader()}
        emptyMessage={t.noDoctorsFound || 'No doctors matching search criteria'}
        error={error}
        refreshing={loading === 'pending'}
        onRefresh={() => dispatch(fetchDoctors({ useCache: false }))}
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
