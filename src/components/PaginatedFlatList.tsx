import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export const PaginatedFlatList = ({
  data = [],
  renderItem,
  keyExtractor,
  headerComponent,
  footerComponent,
  isInitialLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  onRetry,
  error,
  emptyMessage = 'No data found',
  renderSkeleton,
  skeletonCount = 4,
  numColumns = 1,
}) => {
  const loadingRef = useRef(false);

  const handleEndReached = useCallback(() => {
    if (loadingRef.current || isInitialLoading || isFetchingMore || !hasMore || data.length === 0) {
      return;
    }
    loadingRef.current = true;
    Promise.resolve(onLoadMore?.()).finally(() => {
      loadingRef.current = false;
    });
  }, [hasMore, isFetchingMore, isInitialLoading, onLoadMore, data.length]);

  const listData = isInitialLoading && data.length === 0
    ? Array.from({ length: skeletonCount }, (_, index) => ({ id: `skeleton-${index}`, _isSkeleton: true }))
    : data;

  const actualRenderItem = useCallback(
    (info) => {
      if (info.item?._isSkeleton) {
        return renderSkeleton ? renderSkeleton() : null;
      }
      return renderItem(info);
    },
    [renderItem, renderSkeleton]
  );

  const actualKeyExtractor = useCallback(
    (item, index) => {
      if (item?._isSkeleton) {
        return item.id;
      }
      return keyExtractor ? keyExtractor(item, index) : `item-${index}`;
    },
    [keyExtractor]
  );

  const renderEmpty = () => {
    if (isInitialLoading) return null;

    if (error) {
      return (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View>
        {isFetchingMore && hasMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color="#2D5B30" />
            <Text style={styles.footerText}>Loading more...</Text>
          </View>
        ) : error && data.length > 0 && onRetry ? (
          <TouchableOpacity onPress={onRetry} style={styles.footerRetry}>
            <Text style={styles.retryText}>Retry loading more</Text>
          </TouchableOpacity>
        ) : null}

        {footerComponent || null}
      </View>
    );
  };

  return (
    <FlatList
      data={listData}
      numColumns={numColumns}
      key={numColumns}
      renderItem={actualRenderItem}
      keyExtractor={actualKeyExtractor}
      ListHeaderComponent={headerComponent}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.2}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmpty()}
      ListFooterComponent={renderFooter()}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={false}
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  footerRetry: {
    padding: 12,
    alignItems: 'center',
  },
  retryText: {
    color: '#B91C1C',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
  },
});

