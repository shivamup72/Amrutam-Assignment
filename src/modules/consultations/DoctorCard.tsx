import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';

export const DoctorCard = memo(({ doctor, onSelect }) => {
  const { isDarkMode, language } = useSelector((state) => state.dev);
  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Image source={{ uri: doctor.avatarUrl }} style={styles.avatar} />
        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
              {doctor.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.starText}>⭐ {doctor.rating}</Text>
            </View>
          </View>
          <Text style={[styles.specialty, { color: colors.primary }]}>{doctor.specialty}</Text>
          <Text style={[styles.expText, { color: colors.textMuted }]}>
            {doctor.experienceYears} Years Experience • {doctor.location}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={[styles.feeLabel, { color: colors.textMuted }]}>{t.consultationFee}</Text>
          <Text style={[styles.feeVal, { color: colors.textPrimary }]}>
            ₹{doctor.consultationFee}
          </Text>
        </View>

        <View style={styles.rightActions}>
          {doctor.isAvailableToday ? (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>🟢 {t.availableToday}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() => onSelect(doctor)}
          >
            <Text style={styles.bookBtnText}>{t.viewDetails}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

DoctorCard.displayName = 'DoctorCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  starText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  specialty: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  expText: {
    fontSize: 12,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feeLabel: {
    fontSize: 11,
  },
  feeVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todayBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
