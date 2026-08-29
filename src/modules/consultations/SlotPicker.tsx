import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import { translations } from '../../core/i18n/i18n';

export const SlotPicker = ({ slots = [], selectedSlotId, onSelectSlot }) => {
  const { isDarkMode, language } = useSelector((state) => state.dev);
  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t.selectSlot}</Text>
      <View style={styles.grid}>
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isBooked = slot.isBooked;
          const isExpired = slot.isExpired;

          let btnBg = colors.badgeBg;
          let textColor = colors.textPrimary;
          let badgeText = 'Available';

          if (isExpired) {
            btnBg = '#F3F4F6';
            textColor = '#9CA3AF';
            badgeText = 'Expired';
          } else if (isBooked) {
            btnBg = '#FEE2E2';
            textColor = '#991B1B';
            badgeText = 'Booked';
          } else if (isSelected) {
            btnBg = colors.primary;
            textColor = '#FFFFFF';
            badgeText = 'Selected';
          }

          return (
            <TouchableOpacity
              key={slot.id}
              disabled={isBooked || isExpired}
              onPress={() => onSelectSlot(slot.id)}
              style={[
                styles.slotBtn,
                {
                  backgroundColor: btnBg,
                  borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                },
              ]}
            >
              <Text style={[styles.slotTime, { color: textColor }]}>{slot.time}</Text>
              <Text style={[styles.slotBadge, { color: textColor }]}>{badgeText}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotBtn: {
    width: '47%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  slotBadge: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
