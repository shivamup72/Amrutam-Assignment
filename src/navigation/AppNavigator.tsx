import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from '../theme/theme';
import { translations } from '../core/i18n/i18n';
import { Header } from '../components/Header';

// Screens Imports
import { ConsultationsScreen } from '../modules/consultations/ConsultationsScreen';
import { ShopScreen } from '../modules/shop/ShopScreen';
import { HealthRecordsScreen } from '../modules/health_records/HealthRecordsScreen';
import { DoctorDetailScreen } from '../screens/DoctorDetailScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { UpcomingBookingsScreen } from '../screens/UpcomingBookingsScreen';

export const navigationRef = createNavigationContainerRef();

export function safeNavigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBar = memo(({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, language } = useSelector((state) => state.dev || {});
  const t = translations[language] || translations.en;

  const bottomPadding = Math.max(insets.bottom, 8);

  const tabsConfig = [
    {
      name: 'Consultations',
      label: t.consultations,
      icon: require('../assest/images/consultant.png'),
    },
    {
      name: 'Shop',
      label: t.shop,
      icon: require('../assest/images/shop.jpg'),
    },
    {
      name: 'HealthRecords',
      label: t.healthRecords,
      icon: require('../assest/images/medicalrecord.jpg'),
    },
  ];

  return (
    <View
      style={[
        styles.customTabBarContainer,
        {
          backgroundColor: isDarkMode ? '#141E17' : '#EBF0F8',
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = tabsConfig[index] || tabsConfig[0];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.tabButton}
            >
              {isFocused ? (
                <View style={[styles.activePill, { backgroundColor: isDarkMode ? '#3A643B' : '#2D5B30' }]}>
                  <Image source={config.icon} style={styles.activeTabImage} resizeMode="contain" />
                  <Text style={styles.activeLabelText}>{config.label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveItem}>
                  <Image
                    source={config.icon}
                    style={[styles.inactiveTabImage, { opacity: isDarkMode ? 0.6 : 0.75 }]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.inactiveLabelText, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
                    {config.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

CustomTabBar.displayName = 'CustomTabBar';

function BottomTabs() {
  const renderTabBar = useCallback((props) => <CustomTabBar {...props} />, []);

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Consultations" component={ConsultationsScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="HealthRecords" component={HealthRecordsScreen} />
    </Tab.Navigator>
  );
}

const AppNavigatorContent = ({ shouldShowAppHeader }) => {
  return (
    <View style={styles.container}>
      {shouldShowAppHeader ? <Header /> : null}
      <View style={styles.body}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="UpcomingBookings" component={UpcomingBookingsScreen} />
        </Stack.Navigator>
      </View>
    </View>
  );
};

export const AppNavigator = () => {
  const [currentRouteName, setCurrentRouteName] = useState('Consultations');
  const shouldShowAppHeader = ['Consultations', 'Shop', 'HealthRecords'].includes(currentRouteName);

  const handleNavigationStateChange = (state) => {
    let route = state?.routes?.[state.index];

    while (route?.state?.routes?.length) {
      route = route.state.routes[route.state.index];
    }

    setCurrentRouteName(route?.name || 'Consultations');
  };

  return (
    <NavigationContainer ref={navigationRef} onStateChange={handleNavigationStateChange}>
      <AppNavigatorContent shouldShowAppHeader={shouldShowAppHeader} />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  customTabBarContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    paddingTop: 8,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  activeTabImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  inactiveTabImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  activeLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  inactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  inactiveLabelText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
