import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../store/slices/devSlice';
import { lightTheme, darkTheme, spacing } from '../theme/theme';
import { translations } from '../core/i18n/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];

export const LanguageModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { isDarkMode, language } = useSelector((state) => state.dev);
  const colors = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language] || translations.en;

  const handleSelectLanguage = (code) => {
    dispatch(setLanguage(code));
    onClose();
  };

  const renderItem = ({ item }) => {
    const isSelected = language === item.code;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.languageOption,
          {
            backgroundColor: isSelected ? colors.primaryLight : 'transparent',
            borderColor: isSelected ? colors.primary : colors.surfaceBorder,
          },
        ]}
        onPress={() => handleSelectLanguage(item.code)}
      >
        <View style={styles.optionLeft}>
          <Text style={styles.flagText}>{item.flag}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.languageName, { color: colors.textPrimary }]}>
              {item.name}
            </Text>
            <Text style={[styles.nativeName, { color: colors.textMuted }]}>
              {item.nativeName}
            </Text>
          </View>
        </View>

        {isSelected ? (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : (
          <View style={[styles.uncheckCircle, { borderColor: colors.textMuted }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  {t.selectAppLanguage}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t.chooseLanguage}
              </Text>

              <FlatList
                data={LANGUAGES}
                keyExtractor={(item) => item.code}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  listContent: {
    gap: spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flagText: {
    fontSize: 24,
  },
  textContainer: {
    gap: 2,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '700',
  },
  nativeName: {
    fontSize: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  uncheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
});
