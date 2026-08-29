import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Skeleton = ({ style }) => <View style={[styles.base, style]} />;

export const DashboardSkeleton = () => <View style={styles.doctorCard}><Skeleton style={styles.avatar} /><View style={styles.lines}><Skeleton style={styles.lineLarge} /><Skeleton style={styles.line} /><Skeleton style={styles.lineSmall} /></View></View>;
export const ShopProductSkeleton = () => <View style={styles.productCard}><Skeleton style={styles.productImage} /><Skeleton style={styles.lineLarge} /><Skeleton style={styles.line} /><Skeleton style={styles.price} /></View>;
export const HealthRecordSkeleton = () => <View style={styles.recordCard}><Skeleton style={styles.recordIcon} /><View style={styles.lines}><Skeleton style={styles.lineLarge} /><Skeleton style={styles.line} /><Skeleton style={styles.lineSmall} /></View></View>;

const styles = StyleSheet.create({
    base: { backgroundColor: '#E2E8F0', borderRadius: 6 },
    doctorCard: { flexDirection: 'row', padding: 16, marginBottom: 14, borderRadius: 14, backgroundColor: '#F1F5F9' },
    productCard: { padding: 10, marginBottom: 14, borderRadius: 20, backgroundColor: '#F1F5F9' },
    recordCard: { flexDirection: 'row', padding: 14, marginBottom: 12, borderRadius: 16, backgroundColor: '#F1F5F9' },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    productImage: { width: '100%', height: 140, marginBottom: 10, borderRadius: 16 },
    recordIcon: { width: 44, height: 44, borderRadius: 22 },
    lines: { flex: 1, marginLeft: 12, justifyContent: 'center', gap: 8 },
    lineLarge: { width: '75%', height: 14 },
    line: { width: '55%', height: 11 },
    lineSmall: { width: '40%', height: 10 },
    price: { width: '35%', height: 18, marginTop: 10 },
});
