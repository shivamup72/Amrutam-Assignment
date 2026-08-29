/**
 * Modern Left-to-Right Slide Profile Drawer Component
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toggleDarkMode, toggleBiometricEnabled, addToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme, spacing } from '../theme/theme';
import { translations } from '../core/i18n/i18n';
import { LanguageModal } from './LanguageModal';
import { offlineEngine } from '../core/offline/offlineEngine';
import { safeNavigate } from '../navigation/AppNavigator';

export const ProfileDrawer = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const drawerWidth = Math.min(screenWidth * 0.85, 380);

  // Initialized at -drawerWidth (off-screen left)
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { isDarkMode, language, isBiometricEnabled } = useSelector((state) => state.dev || {});
  const { upcomingBookings = [] } = useSelector((state) => state.consultations || {});
  const { cart = [], wishlistIds = [] } = useSelector((state) => state.shop || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const totalCartCount = (cart || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const activeBookingsCount = (upcomingBookings || []).filter((b) => b?.status === 'UPCOMING').length;
  const wishlistCount = (wishlistIds || []).length;

  const langNames = {
    en: `🇬🇧 ${t.english}`,
    hi: `🇮🇳 ${t.hindi}`,
  };

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-drawerWidth);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, drawerWidth, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNavigate = (screen) => {
    handleClose();
    safeNavigate(screen);
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.drawerContent,
                  {
                    width: drawerWidth,
                    backgroundColor: colors.surface,
                    borderColor: colors.surfaceBorder,
                    paddingTop: Math.max(insets.top, spacing.lg),
                    paddingBottom: Math.max(insets.bottom, spacing.lg),
                    transform: [{ translateX: slideAnim }],
                  },
                ]}
              >
                {/* Drawer Header */}
                <View style={styles.drawerHeader}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {t.profileSettings}
                  </Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                    <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
                  {/* User Profile Card */}
                  <View style={[styles.profileCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarInitial}>PS</Text>
                      <View style={styles.onlineDot} />
                    </View>

                    <View style={styles.profileInfo}>
                      <Text style={[styles.userName, { color: colors.textPrimary }]}>Shivam Upadhyay</Text>
                      <Text style={[styles.userMeta, { color: colors.primary }]}>Patient ID: AMR-84920</Text>
                      <View style={styles.prakritiBadge}>
                        <Text style={styles.prakritiText}>🌿 Pitta-Kapha Prakriti</Text>
                      </View>
                    </View>
                  </View>

                  {/* Section 1: My Health & Activity */}
                  <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{t.myActivity}</Text>

                  {/* Consultations Item */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.menuItem, { backgroundColor: colors.badgeBg }]}
                    onPress={() => handleNavigate('UpcomingBookings')}
                  >
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>🩺</Text>
                      <Text style={[styles.menuText, { color: colors.textPrimary }]}>{t.myConsultations}</Text>
                    </View>
                    {activeBookingsCount > 0 ? (
                      <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.countBadgeText}>{activeBookingsCount} {t.active}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                    )}
                  </TouchableOpacity>

                  {/* Wishlist Item */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.menuItem, { backgroundColor: colors.badgeBg }]}
                    onPress={() => handleNavigate('Wishlist')}
                  >
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>❤️</Text>
                      <Text style={[styles.menuText, { color: colors.textPrimary }]}>{t.savedWishlist}</Text>
                    </View>
                    {wishlistCount > 0 ? (
                      <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.countBadgeText}>{wishlistCount}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                    )}
                  </TouchableOpacity>

                  {/* Cart Item */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.menuItem, { backgroundColor: colors.badgeBg }]}
                    onPress={() => handleNavigate('Cart')}
                  >
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>🛒</Text>
                      <Text style={[styles.menuText, { color: colors.textPrimary }]}>{t.shoppingCart}</Text>
                    </View>
                    {totalCartCount > 0 ? (
                      <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.countBadgeText}>{totalCartCount} {t.items}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                    )}
                  </TouchableOpacity>

                  {/* Section 2: Preferences & Theme */}
                  <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{t.profileSettings}</Text>

                  {/* Language Selector Item */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.menuItem, { backgroundColor: colors.badgeBg }]}
                    onPress={() => setShowLanguageModal(true)}
                  >
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>🌐</Text>
                      <Text style={[styles.menuText, { color: colors.textPrimary }]}>{t.appLanguage}</Text>
                    </View>
                    <View style={styles.valRow}>
                      <Text style={[styles.valText, { color: colors.primary }]}>{langNames[language] || t.english}</Text>
                      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Theme Toggle Item */}
                  <View style={[styles.menuItem, { backgroundColor: colors.badgeBg }]}>
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                      <Text style={[styles.menuText, { color: colors.textPrimary }]}>{t.darkMode}</Text>
                    </View>
                    <Switch
                      value={isDarkMode}
                      onValueChange={() => dispatch(toggleDarkMode())}
                      trackColor={{ false: '#CBD5E1', true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {/* Biometric Lock Toggle Item */}
                  <View style={[styles.menuItem, { backgroundColor: colors.badgeBg }]}>
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>🔒</Text>
                      <Text style={[styles.menuText, { color: colors.textPrimary }]}>{t.biometricLock}</Text>
                    </View>
                    <Switch
                      value={isBiometricEnabled}
                      onValueChange={() => {
                        dispatch(toggleBiometricEnabled());
                        dispatch(
                          addToast({
                            type: isBiometricEnabled ? 'info' : 'success',
                            title: !isBiometricEnabled ? t.biometricSecurityEnabled : t.biometricSecurityDisabled,
                            message: !isBiometricEnabled
                              ? t.biometricActivated
                              : t.biometricDisabled,
                          })
                        );
                      }}
                      trackColor={{ false: '#CBD5E1', true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </ScrollView>

                {/* Footer App Info */}
                <View style={[styles.drawerFooter, { borderTopColor: colors.surfaceBorder }]}>
                  <Text style={[styles.footerVersion, { color: colors.textMuted }]}>Amrutam Ayurvedic v1.0.4</Text>
                  <Text style={[styles.footerSub, { color: colors.textMuted }]}>Authentic Holistic Wellness</Text>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Language Selection Modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-start', // Anchored to left edge
  },
  drawerContent: {
    height: '100%',
    borderRightWidth: 1, // Border on right edge when drawer is on left
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F020',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userMeta: {
    fontSize: 11,
    fontWeight: '700',
  },
  prakritiBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  prakritiText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A643B',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '400',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valText: {
    fontSize: 12,
    fontWeight: '700',
  },
  drawerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
