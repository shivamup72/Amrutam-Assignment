/**
 * Doctor Detail Screen (React Navigation Stack Screen)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { bookConsultationSlot } from '../store/slices/consultationsSlice';
import { addToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';
import { SlotPicker } from '../modules/consultations/SlotPicker';

export const DoctorDetailScreen = ({ route, navigation }) => {
  const { doctor } = route.params || {};
  const dispatch = useDispatch();
  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev || {});
  const { upcomingBookings = [] } = useSelector((state) => state.consultations || {});

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [validationError, setValidationError] = useState(null);

  if (!doctor) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>Doctor not found</Text>
      </View>
    );
  }

  const handleConfirmBooking = () => {
    if (!selectedSlotId) {
      setValidationError('Please select an available slot to proceed');
      return;
    }

    const slot = doctor.slots.find((s) => s.id === selectedSlotId);
    if (!slot) return;

    if (slot.isExpired) {
      setValidationError(t.slotExpired);
      return;
    }
    if (slot.isBooked) {
      setValidationError(t.slotConflict);
      return;
    }

    const doubleBooking = upcomingBookings.find(
      (b) => b.slotTime === slot.time && b.slotDate === slot.date && b.status === 'UPCOMING'
    );
    if (doubleBooking) {
      setValidationError(t.doubleBooking);
      return;
    }

    dispatch(bookConsultationSlot({ doctorId: doctor.id, slotId: selectedSlotId, isOffline }));

    if (isOffline) {
      dispatch(addToast({ type: 'info', title: 'Offline Booking Queued', message: t.bookingQueuedOffline }));
    } else {
      dispatch(addToast({ type: 'success', title: t.bookingSuccess, message: `${doctor.name} at ${slot.time}` }));
    }

    setValidationError(null);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Doctor Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.docHeaderRow}>
          <Image source={{ uri: doctor.avatarUrl }} style={styles.avatar} />
          <View style={styles.headerTextCol}>
            <Text style={[styles.docName, { color: colors.textPrimary }]}>{doctor.name}</Text>
            <Text style={[styles.docSpec, { color: colors.primary }]}>{doctor.specialty}</Text>
            <Text style={[styles.docMeta, { color: colors.textMuted }]}>
              {doctor.experienceYears} Years Exp • ⭐ {doctor.rating} Rating
            </Text>
            <Text style={[styles.docMeta, { color: colors.textMuted }]}>
              Location: {doctor.location}
            </Text>
          </View>
        </View>

        <View style={[styles.feeCard, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.feeTitle, { color: colors.textSecondary }]}>
            Video Consultation Fee
          </Text>
          <Text style={[styles.feeAmount, { color: colors.textPrimary }]}>
            ₹{doctor.consultationFee}
          </Text>
        </View>

        <SlotPicker
          slots={doctor.slots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={(id) => {
            setSelectedSlotId(id);
            setValidationError(null);
          }}
        />

        {validationError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {validationError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmBtnText}>{t.bookConsultation}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  headerTextCol: {
    flex: 1,
  },
  docName: {
    fontSize: 18,
    fontWeight: '800',
  },
  docSpec: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  docMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  feeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  feeTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
