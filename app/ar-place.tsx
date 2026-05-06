import React from 'react';
import {
    View, StyleSheet, TouchableOpacity, Platform,
    Linking, ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

// ── Expo Go detection (safe) ─────────────────────────────────────────────────
const IS_EXPO_GO = (() => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('expo-constants').default?.appOwnership === 'expo';
    } catch { return false; }
})();

// ── ViroReact is ONLY available in dev builds; safely probe at runtime ────────
// We never actually call require('@viro-community/react-viro') at module-load
// time because Metro will fail to bundle if the package doesn't exist.
// Instead we declare the components as null and keep HAS_VIRO = false while
// running in Expo Go; in a real dev build the package will be present and this
// guard will be replaced with a real import.
const HAS_VIRO = false; // flip to true after: npm i @viro-community/react-viro && expo prebuild

export default function ARPlaceScreen() {
    const router = useRouter();
    // uri and name are used when HAS_VIRO is true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { uri: _uri, name: _name } = useLocalSearchParams<{ uri: string; name: string }>();

    // AR is not available in Expo Go or without ViroReact
    if (!HAS_VIRO || IS_EXPO_GO) {
        return <DevBuildGuide onBack={() => router.back()} />;
    }

    // ── When HAS_VIRO = true, swap the JSX below with ViroARSceneNavigator ──
    return <DevBuildGuide onBack={() => router.back()} />;
}

// ── Dev Build setup guide ─────────────────────────────────────────────────────
function DevBuildGuide({ onBack }: { onBack: () => void }) {
    const steps = [
        { n: '1', cmd: 'npm install @viro-community/react-viro', desc: 'Install ViroReact' },
        { n: '2', cmd: '"plugins": [["@viro-community/react-viro",{"androidXrMode":["AR"]}]]', desc: 'Add to app.json plugins' },
        { n: '3', cmd: 'npx expo prebuild', desc: 'Prebuild native project' },
        { n: '4', cmd: 'npx expo run:android\nor npx expo run:ios', desc: 'Run on physical device' },
    ];

    return (
        <View style={g.root}>
            <View style={g.header}>
                <TouchableOpacity onPress={onBack} style={g.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMain} />
                </TouchableOpacity>
                <Text style={g.headerTitle}>AR Placement</Text>
            </View>

            <ScrollView contentContainerStyle={g.body} showsVerticalScrollIndicator={false}>
                <View style={g.iconRing}>
                    <MaterialCommunityIcons name="augmented-reality" size={48} color={Colors.accentGold} />
                </View>

                <Text style={g.title}>Dev Build Required</Text>
                <Text style={g.sub}>
                    AR plane detection uses ARKit (iOS) and ARCore (Android) — native APIs that
                    Expo Go doesn&apos;t support. Build your own dev client to unlock it.
                </Text>

                <Text style={g.stepTitle}>SETUP STEPS</Text>
                {steps.map(step => (
                    <View key={step.n} style={g.step}>
                        <View style={g.stepNum}>
                            <Text style={g.stepNumTxt}>{step.n}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={g.stepDesc}>{step.desc}</Text>
                            <View style={g.codeBox}>
                                <Text style={g.code}>{step.cmd}</Text>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={g.tipBox}>
                    <Text style={g.tipTitle}>💡 AR Features</Text>
                    <Text style={g.tipBody}>
                        Once built:{'\n'}
                        • Point camera at any flat surface{'\n'}
                        • Tap to place your 3D model{'\n'}
                        • Pinch to scale the model up/down{'\n'}
                        • Drag to reposition on the plane
                    </Text>
                </View>

                <TouchableOpacity
                    style={g.docsBtn}
                    onPress={() => Linking.openURL('https://viro-community.github.io/viro-docs/')}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="open-in-new" size={14} color={Colors.primary} />
                    <Text style={g.docsBtnTxt}>Open ViroReact Docs</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const g = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.primary },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 16,
        backgroundColor: Colors.secondary,
        borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    backBtn: { padding: 4 },
    headerTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 20 },
    body: { alignItems: 'center', padding: 24, paddingBottom: 60 },
    iconRing: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    title: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 24, marginBottom: 12 },
    sub: {
        color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 14,
        textAlign: 'center', lineHeight: 22, marginBottom: 32,
    },
    stepTitle: {
        color: Colors.textMuted, fontFamily: 'Lato-Regular',
        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
        marginBottom: 16, alignSelf: 'flex-start',
    },
    step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20, width: '100%' },
    stepNum: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(212,175,55,0.15)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
    },
    stepNumTxt: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 13 },
    stepDesc: { color: Colors.textMain, fontFamily: 'Lato-Bold', fontSize: 13, marginBottom: 6 },
    codeBox: {
        backgroundColor: '#0A0A0A', borderRadius: 8, padding: 10,
        borderWidth: 1, borderColor: Colors.borderSubtle,
    },
    code: { color: Colors.accentGold, fontFamily: 'Lato-Regular', fontSize: 12, lineHeight: 18 },
    tipBox: {
        width: '100%', marginTop: 8, marginBottom: 24, padding: 18,
        backgroundColor: 'rgba(212,175,55,0.07)',
        borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
    },
    tipTitle: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 14, marginBottom: 10 },
    tipBody: { color: Colors.textMain, fontFamily: 'Lato-Regular', fontSize: 13, lineHeight: 22 },
    docsBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.accentGold, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 10,
    },
    docsBtnTxt: { color: Colors.primary, fontFamily: 'Lato-Bold', fontSize: 14 },
});
