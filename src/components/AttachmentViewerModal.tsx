import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../theme/theme';

export const AttachmentViewerModal = ({
  visible,
  title,
  type = 'image',
  url,
  onClose,
}) => {
  const { isDarkMode } = useSelector((state) => state.dev);
  const colors = isDarkMode ? darkTheme : lightTheme;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>
                {type === 'pdf' ? '📄' : '🖼️'}
              </Text>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {title || 'Attachment Preview'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {type === 'pdf' ? (
              <View style={[styles.pdfContainer, { backgroundColor: colors.badgeBg }]}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📕</Text>
                <Text style={[styles.pdfTitle, { color: colors.textPrimary }]}>
                  {title || 'Medical_Record_Doc.pdf'}
                </Text>
                <Text style={[styles.pdfSub, { color: colors.textMuted }]}>
                  PDF Document (Verified Amrutam Health Record)
                </Text>
                <View style={[styles.pdfPage, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.pdfText, { color: colors.textSecondary }]}>
                    --- AMRUTAM CLINICAL DIAGNOSTIC SUMMARY ---{'\n\n'}
                    Patient Prakriti Analysis: Vata-Pitta Balance{'\n'}
                    Pulse (Nadi): Regular 72 bpm{'\n'}
                    Prescription: Amrutam Kuntal Care & Nari Soundarya Malt{'\n'}
                    Status: Authenticated & Digitally Signed
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.imageContainer}>
                {url ? (
                  <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
                ) : (
                  <Text style={{ color: colors.textMuted }}>No image URL available</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.btnText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
    minHeight: 280,
    justifyContent: 'center',
  },
  pdfContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  pdfSub: {
    fontSize: 12,
    marginBottom: 16,
  },
  pdfPage: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pdfText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
