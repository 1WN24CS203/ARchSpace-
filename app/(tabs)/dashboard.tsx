import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { getUserProjects } from '@/services/userStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const [activeDesignsCount, setActiveDesignsCount] = useState(0);
	const [projectsLoading, setProjectsLoading] = useState(false);

	const isTablet = width >= 768;
	const isCompact = width < 360;
	const contentMaxWidth = isTablet ? 760 : undefined;
	const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

	const greetingName = useMemo(() => {
		if (!user) return '';
		return String(user.displayName ?? user.email).trim();
	}, [user]);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!user?.email) {
				setActiveDesignsCount(0);
				return;
			}

			setProjectsLoading(true);
			try {
				const projects = await getUserProjects(user.email);
				if (!cancelled) {
					setActiveDesignsCount(projects.length);
				}
			} finally {
				if (!cancelled) {
					setProjectsLoading(false);
				}
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [user?.email]);


	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: 48 + insets.bottom },
				]}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.content,
						{
							maxWidth: contentMaxWidth,
							paddingHorizontal: horizontalPadding,
						},
					]}
				>
					<View style={styles.header}>
				<Text variant="headlineMedium" style={styles.greeting}>
					Welcome back{greetingName ? `, ${greetingName}` : ''}
				</Text>
				<Text variant="titleMedium" style={styles.subtitle}>
					Here is your workspace overview
				</Text>
					</View>

					<View style={styles.statsContainer}>
				<Surface style={styles.statCard} elevation={2}>
					<Text variant="displaySmall" style={styles.statNumber}>
						{projectsLoading ? '…' : activeDesignsCount}
					</Text>
					<Text variant="labelMedium" style={styles.statLabel}>
						Active Designs
					</Text>
				</Surface>
					</View>

					<View style={styles.section}>
				<Text variant="titleLarge" style={styles.sectionTitle}>
					Quick Actions
				</Text>

				<Surface style={styles.actionCard} elevation={1}>
					<View style={styles.actionRow}>
						<View style={styles.actionTextContainer}>
							<Text variant="titleMedium" style={styles.actionTitle}>
								Create New Project
							</Text>
							<Text variant="bodySmall" style={styles.actionSubtitle}>
								Define AR params, budget & more
							</Text>
						</View>
						<CustomButton
							title="New Project"
							onPress={() => router.push('/new-project' as any)}
							variant="gold"
							style={[
								styles.actionButton,
								{
									minWidth: isCompact ? 96 : isTablet ? 160 : 120,
									paddingHorizontal: isCompact ? 12 : 16,
									paddingVertical: isCompact ? 8 : 10,
								},
							]}
						/>
					</View>
				</Surface>

				<Surface style={styles.actionCard} elevation={1}>
					<View style={styles.actionRow}>
						<View style={styles.actionTextContainer}>
							<Text variant="titleMedium" style={styles.actionTitle}>
								Start New AR Scan
							</Text>
							<Text variant="bodySmall" style={styles.actionSubtitle}>
								Visualize room templates
							</Text>
						</View>
						<CustomButton 
							title="Scan Room" 
							onPress={() => router.push('/ar-preview' as any)} 
							variant="gold" 
							style={[
								styles.actionButton,
								{
									minWidth: isCompact ? 96 : isTablet ? 160 : 120,
									paddingHorizontal: isCompact ? 12 : 16,
									paddingVertical: isCompact ? 8 : 10,
								},
							]}
						/>
					</View>
				</Surface>

				<Surface style={styles.actionCard} elevation={1}>
					<View style={styles.actionRow}>
						<View style={styles.actionTextContainer}>
							<Text variant="titleMedium" style={styles.actionTitle}>
								Calculate Budget
							</Text>
							<Text variant="bodySmall" style={styles.actionSubtitle}>
								Estimate material splits
							</Text>
						</View>
						<CustomButton 
							title="Open Tool" 
							onPress={() => router.push('/(tabs)/budget')} 
							variant="solid" 
							style={[
								styles.actionButton,
								{
									minWidth: isCompact ? 96 : isTablet ? 160 : 120,
									paddingHorizontal: isCompact ? 12 : 16,
									paddingVertical: isCompact ? 8 : 10,
								},
							]}
						/>
					</View>
				</Surface>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.primary,
	},
	container: {
		flex: 1,
		backgroundColor: Colors.primary,
	},
	scrollContent: {
		flexGrow: 1,
	},
	content: {
		width: '100%',
		alignSelf: 'center',
	},
	header: {
		paddingTop: 16,
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
		paddingVertical: 8,
		justifyContent: 'space-between',
	},
	statCard: {
		flex: 1,
		backgroundColor: Colors.card,
		padding: 20,
		marginHorizontal: 0,
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
		paddingTop: 24,
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
		flexWrap: 'wrap',
	},
	actionTextContainer: {
		flex: 1,
		marginRight: 16,
		minWidth: 180,
	},
	actionTitle: {
		color: Colors.textMain,
		fontFamily: 'Lato-Bold',
		marginBottom: 4,
	},
	actionSubtitle: {
		color: Colors.textMuted,
		fontFamily: 'Lato-Regular',
	},
	actionButton: {
		alignSelf: 'flex-start',
	},
});
