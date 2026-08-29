import { useEffect, useRef } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useSelector, useDispatch } from 'react-redux';
import { setBiometricAuthenticated, addToast } from '../store/slices/devSlice';

export const BiometricAuthModal = () => {
  const dispatch = useDispatch();
  const { isBiometricEnabled, isBiometricAuthenticated } = useSelector(
    (state) => state.dev || {}
  );
  const isMounted = useRef(true);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const visible = Boolean(isBiometricEnabled && !isBiometricAuthenticated);

  const handleAuthenticate = async () => {
    try {
      const biometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
      const availability = await biometrics.isSensorAvailable();
      if (!availability.available) {
        throw new Error(availability.error || 'No device authentication method is configured');
      }

      const result = await biometrics.simplePrompt({
        promptMessage: 'Unlock Amrutam',
        fallbackPromptMessage: 'Use your device passcode or pattern',
        cancelButtonText: 'Cancel',
      });

      if (!isMounted.current) return;
      if (result.success) {
        dispatch(setBiometricAuthenticated(true));
        dispatch(
          addToast({
            type: 'success',
            title: 'Device Authenticated',
            message: 'Welcome back, Shivam Upadhyay',
          })
        );
      } else {
        return;
      }
    } catch (error) {
      if (!isMounted.current) return;
      return;
    }
  };

  useEffect(() => {
    if (visible) handleAuthenticate();
  }, [visible]);

  return null;
};
