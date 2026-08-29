/**
 * Clean Modern Header Component (App Logo on Left, Profile Drawer Avatar on Right)
 * Styled after AyurWellness Ayurvedic Super App design system
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';
import { ProfileDrawer } from './ProfileDrawer';
import { offlineEngine } from '../core/offline/offlineEngine';
import { safeNavigate } from '../navigation/AppNavigator';

export const Header = () => {
  const insets = useSafeAreaInsets();

  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev || {});
  const { upcomingBookings = [] } = useSelector((state) => state.consultations || {});
  const { cart = [] } = useSelector((state) => state.shop || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const activeBookingsCount =
    (upcomingBookings || []).filter((b) => b?.status === 'UPCOMING').length || 0;
  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const pendingQueueCount = offlineEngine?.getQueue?.()?.length || 0;

  const paddingTop = 12;

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.surfaceBorder,
            paddingTop,
          },
        ]}
      >
        <View style={styles.topRow}>
          {/* Left: Brand Logo & Title (AyurWellness) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.brandContainer}
            onPress={() => safeNavigate('MainTabs', { screen: 'Consultations' })}
          >
            <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoIcon}>🌿</Text>
            </View>

            <View style={styles.brandTextGroup}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                AyurWellness
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.primary }]}>
                AYURVEDIC SUPER APP
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Controls: Cart, Offline Status & Avatar */}
          <View style={styles.controlsRow}>
            {/* Offline Indicator */}
            {(isOffline || pendingQueueCount > 0) && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isOffline ? '#FEE2E2' : '#FEF3C7',
                    borderColor: isOffline ? '#FCA5A5' : '#FDE68A',
                  },
                ]}
                onPress={() => setShowProfileDrawer(true)}
              >
                <Text style={[styles.statusBadgeText, { color: isOffline ? '#991B1B' : '#92400E' }]}>
                  {isOffline ? '⚡ Offline' : `🔄 ${pendingQueueCount}`}
                </Text>
              </TouchableOpacity>
            )}

            {/* Quick Cart Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.iconBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => safeNavigate('Cart')}
            >
              <Text style={styles.cartIconText}>🛒</Text>
              {totalCartCount > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: colors.secondary || '#E07A5F' }]}>
                  <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Avatar */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.avatarBtn,
                {
                  backgroundColor: colors.primary,
                  borderColor: isDarkMode ? colors.surfaceBorder : '#FFFFFF',
                },
              ]}
              onPress={() => setShowProfileDrawer(true)}
            >
              <Text style={styles.avatarText}>PS</Text>

              <View style={styles.onlineBadgeDot} />

              {activeBookingsCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: colors.secondary || '#E07A5F' },
                  ]}
                >
                  <Text style={styles.notificationText}>
                    {activeBookingsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile & Settings Drawer */}
      <ProfileDrawer
        visible={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A643B',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartIconText: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  onlineBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
