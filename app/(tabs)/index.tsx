import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>Welcome back,</Text>
        <Text variant="titleMedium" style={styles.subtitle}>Here is your workspace overview</Text>
      </View>

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <Text variant="displaySmall" style={styles.statNumber}>12</Text>
          <Text variant="labelMedium" style={styles.statLabel}>Active Designs</Text>
        </Surface>
        <Surface style={[styles.statCard, styles.statCardAccent]} elevation={2}>
          <Text variant="displaySmall" style={[styles.statNumber, { color: Colors.primary }]}>4</Text>
          <Text variant="labelMedium" style={[styles.statLabel, { color: Colors.primary }]}>Client Reviews</Text>
        </Surface>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Quick Actions</Text>

        <Surface style={styles.actionCard} elevation={1}>
          <View style={styles.actionRow}>
            <View>
              <Text variant="titleMedium" style={styles.actionTitle}>Start New AR Scan</Text>
              <Text variant="bodySmall" style={styles.actionSubtitle}>Visualize room templates</Text>
            </View>
            <CustomButton title="Scan Room" onPress={() => router.push('/ar-preview' as any)} variant="gold" />
          </View>
        </Surface>

        <Surface style={styles.actionCard} elevation={1}>
          <View style={styles.actionRow}>
            <View>
              <Text variant="titleMedium" style={styles.actionTitle}>Calculate Budget</Text>
              <Text variant="bodySmall" style={styles.actionSubtitle}>Estimate material splits</Text>
            </View>
            <CustomButton title="Open Tool" onPress={() => router.push('/(tabs)/budget')} variant="solid" />
          </View>
        </Surface>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  greeting: {
    color: Colors.textMain,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  subtitle: {
    color: Colors.textMuted,
    marginTop: 4,
    fontFamily: 'Lato-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 20,
    marginHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  statCardAccent: {
    backgroundColor: Colors.accentGoldHover,
    borderColor: Colors.accentGoldHover,
  },
  statNumber: {
    color: Colors.accentGoldHover,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textMuted,
    fontFamily: 'Lato-Regular',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    padding: 24,
    paddingBottom: 80,
  },
  sectionTitle: {
    color: Colors.textMain,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    color: Colors.textMain,
    fontFamily: 'Lato-Bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: Colors.textMuted,
    fontFamily: 'Lato-Regular',
  }
});