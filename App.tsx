/**
 * Amrutam Ayurvedic Super App - Main Entrypoint
 */

import React from 'react';
import { View, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/store';
import { lightTheme, darkTheme } from './src/theme/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GlobalToastContainer } from './src/components/GlobalToast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BiometricAuthModal } from './src/components/BiometricAuthModal';

function MainApp() {
  const { isDarkMode, isBiometricEnabled, isBiometricAuthenticated } = useSelector((state) => state.dev);
  const colors = isDarkMode ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();

  const isLargeScreen = width > 1280;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.container, isLargeScreen && styles.desktopContainer]}>
          {!isBiometricEnabled || isBiometricAuthenticated ? <AppNavigator /> : null}
        </View>
        {!isBiometricEnabled || isBiometricAuthenticated ? <GlobalToastContainer /> : null}
        <BiometricAuthModal />
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <MainApp />
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  desktopContainer: {
    maxWidth: 1360,
    alignSelf: 'center',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.08)',
  },
});
