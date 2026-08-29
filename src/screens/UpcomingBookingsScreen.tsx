import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { cancelConsultationBooking } from '../store/slices/consultationsSlice';
import { addToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';
import { VirtualizedGrid } from '../components/VirtualizedGrid';

export const UpcomingBookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isDarkMode, language, isOffline } = useSelector((state) => state.dev);
  const { upcomingBookings } = useSelector((state) => state.consultations);

  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  const renderBookingItem = useCallback(({ item: booking }) => {
    const isCancelled = booking.status === 'CANCELLED';

    return (
      <View
        style={[
          styles.bookingCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.bookingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.docName, { color: colors.textPrimary }]}>{booking.doctorName}</Text>
            <Text style={[styles.spec, { color: colors.primary }]}>{booking.specialty}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>⏰ {booking.slotTime} • 🗓️ {booking.slotDate}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.statusBadge, { backgroundColor: isCancelled ? '#FEE2E2' : '#DCFCE7' }]}>
              <Text style={[styles.statusText, { color: isCancelled ? '#991B1B' : '#166534' }]}>{booking.status}</Text>
            </View>
            <Text style={[styles.fee, { color: colors.textPrimary }]}>₹{booking.consultationFee}</Text>
          </View>
        </View>
        {!isCancelled ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              dispatch(cancelConsultationBooking({ bookingId: booking.id, isOffline }));
              dispatch(addToast({ type: 'info', title: t.bookingCancelled, message: t.slotReleased }));
            }}
          >
            <Text style={styles.cancelBtnText}>{t.cancelBooking}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }, [colors, dispatch, isOffline, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>← {t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t.upcomingConsultations} ({upcomingBookings.length})
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <VirtualizedGrid
        data={upcomingBookings}
        pageSize={20}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        emptyMessage={t.noBookingsYet}
      />
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
    transform: [{ translateY: -2 }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  bookingCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
  },
  spec: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fee: {
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
});
