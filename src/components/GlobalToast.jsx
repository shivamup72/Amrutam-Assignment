/**
 * Global Toast System Component (Redux Toolkit)
 * Auto-dismisses after 2 seconds
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../store/slices/devSlice';
import { lightTheme, darkTheme } from '../theme/theme';

const SingleToastItem = ({ toast, colors }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 2000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  let borderLeftColor = colors.primary;
  let icon = 'ℹ️';
  if (toast.type === 'success') {
    borderLeftColor = colors.success;
    icon = '✅';
  } else if (toast.type === 'error') {
    borderLeftColor = colors.danger;
    icon = '❌';
  } else if (toast.type === 'warning') {
    borderLeftColor = colors.warning;
    icon = '⚠️';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => dispatch(removeToast(toast.id))}
      style={[
        styles.toast,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
          borderLeftColor,
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{toast.title}</Text>
        {toast.message ? (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {toast.message}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export const GlobalToastContainer = () => {
  const { toasts = [], isDarkMode } = useSelector((state) => state.dev || {});
  const colors = isDarkMode ? darkTheme : lightTheme;

  if (!toasts || toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <SingleToastItem key={toast.id} toast={toast} colors={colors} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    left: 20,
    maxWidth: 420,
    zIndex: 99999,
    alignSelf: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
  },
});
