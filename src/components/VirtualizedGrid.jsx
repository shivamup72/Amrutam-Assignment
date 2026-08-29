/**
 * Highly Performant Virtualized List / Grid Component (Pure JavaScript)
 * Supports 5,000 Doctors, 20,000 Products, and 10,000 Health Records with Virtualization & Pagination
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../theme/theme';

export function VirtualizedGrid({
  data = [],
  renderItem,
  keyExtractor,
  pageSize = 24,
  numColumns = 1,
  emptyMessage = 'No items found',
  headerComponent,
  onRefresh,
  refreshing = false,
  error = null,
}) {
  const { isDarkMode } = useSelector((state) => state.dev || {});
  const colors = isDarkMode ? darkTheme : lightTheme;

  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFetchingRef = useRef(false);

  // Reset pagination window when data length or dataset reference changes (e.g. search/filters)
  useEffect(() => {
    setDisplayedCount(pageSize);
    isFetchingRef.current = false;
    setIsLoadingMore(false);
  }, [data, data.length, pageSize]);

  const visibleData = useMemo(() => {
    return data.slice(0, displayedCount);
  }, [data, displayedCount]);

  const handleEndReached = useCallback(() => {
    if (isFetchingRef.current || displayedCount >= data.length) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    // Batch load next page of data cleanly
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + pageSize, data.length));
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }, 100);
  }, [displayedCount, data.length, pageSize]);

  const renderFooter = useCallback(() => {
    if (data.length === 0) return null;

    if (isLoadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={[styles.footerText, { color: colors.textMuted, marginLeft: 8 }]}>Loading more...</Text>
        </View>
      );
    }

    if (displayedCount >= data.length) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Showing all {data.length.toLocaleString()} items
          </Text>
        </View>
      );
    }

    return null;
  }, [displayedCount, data.length, colors, isLoadingMore]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{error ? '⚠️' : '🔍'}</Text>
        <Text style={[styles.emptyText, { color: error ? '#B91C1C' : colors.textSecondary }]}>
          {error || emptyMessage}
        </Text>
      </View>
    ),
    [emptyMessage, colors, error]
  );

  return (
    <FlatList
      data={visibleData}
      key={numColumns}
      numColumns={numColumns}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      initialNumToRender={12}
      maxToRenderPerBatch={16}
      windowSize={5}
      removeClippedSubviews={Platform.OS === 'android'}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
