import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';

export const RecordCard = memo(({ record, onPreviewAttachment }) => {
  const { isDarkMode } = useSelector((state) => state.dev || {});
  const colors = isDarkMode ? darkTheme : lightTheme;

  let icon = '📋';
  let badgeText = 'Record';
  let badgeBg = '#EAF3EC';
  let badgeColor = '#2D5B30';

  if (record.type === 'Lab Report') {
    icon = '🧪';
    badgeText = 'Lab Report';
    badgeBg = '#E0F2FE';
    badgeColor = '#0369A1';
  } else if (record.type === 'Prescription') {
    icon = '📄';
    badgeText = 'Prescription';
    badgeBg = '#F3E8FF';
    badgeColor = '#6B21A8';
  } else if (record.type === 'Consultation') {
    icon = '🩺';
    badgeText = 'Consultation';
    badgeBg = '#DCFCE7';
    badgeColor = '#15803D';
  } else if (record.type === 'Vaccination') {
    icon = '💉';
    badgeText = 'Vaccination';
    badgeBg = '#FEF3C7';
    badgeColor = '#B45309';
  }

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
      {/* Left Icon Badge */}
      <View style={[styles.iconCircle, { backgroundColor: badgeBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      {/* Center Details */}
      <View style={styles.centerCol}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {record.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{badgeText}</Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{record.date}</Text>
        </View>

        {record.doctorName ? (
          <Text style={[styles.doctorText, { color: colors.textSecondary }]} numberOfLines={1}>
            Dr. {record.doctorName}
          </Text>
        ) : null}

        {record.tags && record.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {record.tags.map((tag, idx) => (
              <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.badgeBg || '#F1F5F9' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* Right View Pill Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.viewBtn, { backgroundColor: colors.primaryLight || '#EAF3EC' }]}
        onPress={() => onPreviewAttachment(record)}
      >
        <Text style={[styles.viewBtnText, { color: colors.primary }]}>View</Text>
      </TouchableOpacity>
    </View>
  );
});

RecordCard.displayName = 'RecordCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  centerCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  doctorText: {
    fontSize: 12,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
