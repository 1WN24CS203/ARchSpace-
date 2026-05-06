import React, { useState } from 'react';
import {
    View, StyleSheet, TouchableOpacity, Platform,
    ActivityIndicator, Linking,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

/**
 * 3D Model Viewer screen.
 *
 * In Expo Go there is no WebView native module, so we show a rich
 * information card instead and let the user open the model in their
 * browser using Google's model-viewer or a file-manager app.
 *
 * In a dev/production build, swap this component to use
 * react-native-webview (already installed) for the full in-app experience.
 */

// Safely probe for WebView — only available in dev builds
let WebViewComponent: any = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    WebViewComponent = require('react-native-webview').WebView;
} catch {
    WebViewComponent = null;
}

function buildViewerHtml(modelUri: string, modelName: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${modelName}</title>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#0D0D0D;height:100vh;overflow:hidden;}
    model-viewer{width:100vw;height:100vh;background:#0D0D0D;}
    #hint{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.55);color:#C8A84B;font-size:12px;
      padding:6px 16px;border-radius:16px;letter-spacing:1px;pointer-events:none;
      font-family:sans-serif;}
  </style>
</head>
<body>
  <model-viewer src="${modelUri}" alt="${modelName}"
    camera-controls auto-rotate shadow-intensity="1.5"
    environment-image="neutral" exposure="1" tone-mapping="commerce"
    ar ar-modes="webxr scene-viewer quick-look" ar-scale="auto"
    style="width:100%;height:100%">
  </model-viewer>
  <div id="hint">↔ Drag to rotate · Pinch to zoom</div>
</body>
</html>`;
}

// ── Fallback card shown in Expo Go ────────────────────────────────────────────
function ExpoGoFallback({ uri, name, onBack }: { uri: string; name: string; onBack: () => void }) {
    const modelName = name || '3D Model';

    const openInBrowser = () => {
        // Encode the local URI for use as a query param in Google model-viewer demo
        // (works only if the file is web-accessible; otherwise guide user)
        Linking.openURL('https://modelviewer.dev/editor/');
    };

    return (
        <View style={f.root}>
            <View style={f.header}>
                <TouchableOpacity onPress={onBack} style={f.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMain} />
                </TouchableOpacity>
                <Text style={f.headerTitle} numberOfLines={1}>{modelName}</Text>
                <View style={f.badge}>
                    <MaterialCommunityIcons name="cube-outline" size={14} color={Colors.accentGold} />
                    <Text style={f.badgeTxt}>3D Viewer</Text>
                </View>
            </View>

            <View style={f.body}>
                {/* Model info card */}
                <View style={f.modelCard}>
                    <View style={f.modelIconRing}>
                        <MaterialCommunityIcons name="rotate-3d-variant" size={52} color={Colors.accentGold} />
                    </View>
                    <Text style={f.modelName} numberOfLines={2}>{modelName}</Text>
                    <Text style={f.modelPath} numberOfLines={1}>{uri?.split('/').pop()}</Text>
                </View>

                {/* Dev build notice */}
                <View style={f.noticeBox}>
                    <MaterialCommunityIcons name="information-outline" size={18} color={Colors.accentGold} />
                    <Text style={f.noticeTxt}>
                        The in-app 3D viewer requires a <Text style={{ color: Colors.accentGold }}>dev build</Text>.{'\n'}
                        In the meantime, open your model in the browser below.
                    </Text>
                </View>

                {/* Options */}
                <TouchableOpacity style={f.optBtn} onPress={openInBrowser} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="web" size={18} color={Colors.primary} />
                    <Text style={f.optBtnTxt}>Open in model-viewer Editor</Text>
                </TouchableOpacity>

                <Text style={f.devTitle}>ENABLE IN-APP 3D VIEWER</Text>
                {[
                    'npm install react-native-webview',
                    'npx expo prebuild',
                    'npx expo run:android',
                ].map((cmd, i) => (
                    <View key={i} style={f.step}>
                        <View style={f.stepNum}>
                            <Text style={f.stepNumTxt}>{i + 1}</Text>
                        </View>
                        <View style={f.codeBox}>
                            <Text style={f.code}>{cmd}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ModelViewerScreen() {
    const router = useRouter();
    const { uri, name } = useLocalSearchParams<{ uri: string; name: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const modelUri = uri ?? '';
    const modelName = name ?? '3D Model';

    // If no WebView, show fallback immediately
    if (!WebViewComponent) {
        return <ExpoGoFallback uri={modelUri} name={modelName} onBack={() => router.back()} />;
    }

    const html = buildViewerHtml(modelUri, modelName);

    return (
        <View style={s.root}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMain} />
                </TouchableOpacity>
                <Text style={s.headerTitle} numberOfLines={1}>{modelName}</Text>
                <View style={s.arBadge}>
                    <MaterialCommunityIcons name="rotate-3d-variant" size={14} color={Colors.accentGold} />
                    <Text style={s.arBadgeTxt}>3D Viewer</Text>
                </View>
            </View>

            {loading && !error && (
                <View style={s.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.accentGold} />
                    <Text style={s.loadingTxt}>Loading model…</Text>
                </View>
            )}

            {error ? (
                <View style={s.errorBox}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#FF6B6B" />
                    <Text style={s.errorTitle}>Could not load model</Text>
                    <Text style={s.errorDesc}>Make sure the file is a valid .glb or .gltf.</Text>
                </View>
            ) : (
                <WebViewComponent
                    originWhitelist={['*']}
                    source={{ html }}
                    style={s.webview}
                    allowFileAccess
                    allowUniversalAccessFromFileURLs
                    allowFileAccessFromFileURLs
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    onLoadEnd={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                    onHttpError={() => { setLoading(false); setError(true); }}
                />
            )}
        </View>
    );
}

// ── Fallback styles ───────────────────────────────────────────────────────────
const f = StyleSheet.create({
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
    headerTitle: { flex: 1, color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 18 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    badgeTxt: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 11 },
    body: { flex: 1, padding: 24 },
    modelCard: {
        alignItems: 'center', padding: 28,
        backgroundColor: Colors.card,
        borderRadius: 20, borderWidth: 1, borderColor: Colors.borderSubtle,
        marginBottom: 20,
    },
    modelIconRing: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    modelName: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 20, marginBottom: 6, textAlign: 'center' },
    modelPath: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 12 },
    noticeBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: 'rgba(212,175,55,0.07)',
        borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
        marginBottom: 20,
    },
    noticeTxt: { flex: 1, color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 13, lineHeight: 20 },
    optBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: Colors.accentGold, borderRadius: 10,
        paddingVertical: 13, marginBottom: 28,
    },
    optBtnTxt: { color: Colors.primary, fontFamily: 'Lato-Bold', fontSize: 14 },
    devTitle: {
        color: Colors.textMuted, fontFamily: 'Lato-Regular',
        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
        marginBottom: 14,
    },
    step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    stepNum: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: 'rgba(212,175,55,0.15)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    stepNumTxt: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 12 },
    codeBox: {
        flex: 1, backgroundColor: '#0A0A0A',
        borderRadius: 8, padding: 10,
        borderWidth: 1, borderColor: Colors.borderSubtle,
    },
    code: { color: Colors.accentGold, fontFamily: 'Lato-Regular', fontSize: 12 },
});

// ── WebView styles (dev build only) ──────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0D0D0D' },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 14,
        backgroundColor: 'rgba(13,13,13,0.85)',
    },
    backBtn: { padding: 4 },
    headerTitle: { flex: 1, color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 18 },
    arBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(212,175,55,0.12)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    arBadgeTxt: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 11 },
    webview: { flex: 1 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0D0D0D', zIndex: 5, gap: 12,
    },
    loadingTxt: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 14 },
    errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
    errorTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 20 },
    errorDesc: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 14, textAlign: 'center' },
});
