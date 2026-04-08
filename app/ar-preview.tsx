import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

export default function ARPreviewScreen() {
    const router = useRouter();
    const { mode, id } = useLocalSearchParams();

    // mode could be 'room' or 'furniture'. defaults to furniture if empty.
    const isRoomMode = mode === 'room';

    return (
        <View style={styles.container}>
            {/* 
        This is a conceptual placeholder for an AR View 
        In a real app, you would use Expo Camera + a WebGL/Three.js view, or ViroReact 
      */}
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                style={styles.cameraView}
            >
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <Text variant="titleMedium" style={styles.headerTitle}>
                            {isRoomMode ? 'Room Scanner' : 'AR Furniture Placement'}
                        </Text>
                        <CustomButton title="Done" onPress={() => router.back()} style={styles.doneBtn} textStyle={styles.doneText} />
                    </View>

                    <View style={styles.targetReticle}>
                        <View style={styles.reticleCenter} />
                    </View>

                    <Surface style={styles.bottomControls} elevation={4}>
                        <Text style={styles.instruction}>
                            {isRoomMode
                                ? "Slowly pan your camera across the room to map geometry"
                                : "Point camera at floor to place model"}
                        </Text>
                        <View style={styles.actions}>
                            {isRoomMode ? (
                                <CustomButton title="Start Scan" onPress={() => { }} variant="solid" style={styles.actionBtn} />
                            ) : (
                                <>
                                    <CustomButton title="Select Model" onPress={() => { }} variant="gold" style={styles.actionBtn} />
                                    <CustomButton title="Place" onPress={() => { }} variant="solid" style={styles.actionBtn} />
                                </>
                            )}
                        </View>
                    </Surface>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    cameraView: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60, // Safe area approx
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: Colors.textMain,
        fontFamily: 'Lato-Bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    doneBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: 'transparent',
    },
    doneText: {
        color: Colors.textMain,
    },
    targetReticle: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderColor: Colors.accentGoldHover,
        borderRadius: 30,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
    },
    reticleCenter: {
        width: 4,
        height: 4,
        backgroundColor: Colors.accentGoldHover,
        borderRadius: 2,
    },
    bottomControls: {
        backgroundColor: Colors.secondary,
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    instruction: {
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Lato-Regular',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flex: 1,
        marginHorizontal: 8,
    }
});
