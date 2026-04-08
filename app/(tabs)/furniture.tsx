import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

// Mock empty state for the fresh catalog
const MOCK_FURNITURE: any[] = [];

export default function FurnitureScreen() {
    const router = useRouter();

    const launchAR = () => {
        router.push('/ar-preview');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleLarge" style={styles.headerText}>3D Furniture Catalog</Text>
                <Text variant="bodyMedium" style={styles.subtext}>
                    Browse high-fidelity models and test them in your space.
                </Text>
            </View>

            <FlatList
                data={MOCK_FURNITURE}
                keyExtractor={(item, idx) => String(idx)}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={() => null}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No 3D Models loaded yet.</Text>
                        <CustomButton
                            title="Launch AR Workspace"
                            onPress={launchAR}
                            variant="solid"
                            style={styles.arButton}
                        />
                        <CustomButton
                            title="Import 3D Model (.obj/.gltf)"
                            onPress={() => { }}
                            variant="gold"
                            style={styles.importButton}
                        />
                    </View>
                }
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
        marginBottom: 16,
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
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '30%',
    },
    emptyText: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        marginBottom: 32,
    },
    arButton: {
        width: '100%',
        marginBottom: 16,
    },
    importButton: {
        width: '100%',
    }
});
