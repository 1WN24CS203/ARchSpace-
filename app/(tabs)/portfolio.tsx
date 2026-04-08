import React from 'react';
import { View, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

const PORTFOLIO_ROOMS = [
    {
        id: 'r1',
        title: 'Modern Minimalist Bedroom',
        category: 'Bedroom',
        image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'r2',
        title: 'Luxury Marble Bathroom',
        category: 'Bathroom',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'r3',
        title: 'Executive Home Office',
        category: 'Office',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'r4',
        title: 'Open Concept Living',
        category: 'Living Room',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    }
];

export default function PortfolioScreen() {
    const router = useRouter();

    const handleARScan = (roomId: string) => {
        // Pass the context of what we are placing (a whole room template)
        router.push(`/ar-preview?mode=room&id=${roomId}` as any);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleLarge" style={styles.headerText}>Design Library</Text>
                <Text variant="bodyMedium" style={styles.subtext}>
                    Select a room design and scan your space to visualize it in AR.
                </Text>
            </View>

            <FlatList
                data={PORTFOLIO_ROOMS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Surface style={styles.card} elevation={2}>
                        <ImageBackground source={{ uri: item.image }} style={styles.cardImage} imageStyle={styles.imageRounded}>
                            <View style={styles.overlay}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.category}</Text>
                                </View>
                                <View style={styles.bottomSection}>
                                    <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
                                    <CustomButton
                                        title="Visualize in AR"
                                        onPress={() => handleARScan(item.id)}
                                        variant="solid"
                                        style={styles.arButton}
                                    />
                                </View>
                            </View>
                        </ImageBackground>
                    </Surface>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        padding: 20,
        backgroundColor: Colors.secondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSubtle,
    },
    headerText: {
        color: Colors.accentGoldHover,
        fontFamily: 'PlayfairDisplay-Regular',
        marginBottom: 4,
    },
    subtext: {
        color: Colors.textMuted,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        height: 240,
        marginBottom: 24,
        borderRadius: 12,
        backgroundColor: Colors.card,
    },
    cardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    imageRounded: {
        borderRadius: 12,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 12,
        justifyContent: 'space-between',
        padding: 16,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(212, 175, 55, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    badgeText: {
        color: Colors.primary,
        fontFamily: 'Lato-Bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    bottomSection: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    cardTitle: {
        color: Colors.textMain,
        fontFamily: 'PlayfairDisplay-Regular',
        marginBottom: 12,
    },
    arButton: {
        width: '100%',
    }
});
