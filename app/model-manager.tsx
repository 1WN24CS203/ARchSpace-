import React, { useCallback, useState } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity,
    Platform, Alert, Linking,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import {
    getProjectModels, addProjectModel, setProjectModels,
    type ModelAsset,
} from '@/services/userStore';


// ── Tool Links for creating AR models ────────────────────────────────────────
const AR_TOOLS = [
    {
        name: 'Unity (Recommended)',
        icon: 'gamepad-variant' as const,
        tag: 'BEST',
        desc: 'Build AR scenes in Unity, export GLB via File > Export > glTF 2.0 or use AR Foundation',
        url: 'https://unity.com/download',
    },
    {
        name: 'Polycam (iPhone / Android)',
        icon: 'cube-scan' as const,
        tag: 'SCAN',
        desc: 'Scan real rooms with LiDAR or photogrammetry and export .glb',
        url: 'https://poly.cam',
    },
    {
        name: 'Blender (Desktop)',
        icon: 'blender' as const,
        tag: 'FREE',
        desc: 'Industry standard 3D tool. Model, UV-map, then Export → glTF 2.0 (.glb)',
        url: 'https://blender.org',
    },
    {
        name: 'Spline (Web)',
        icon: 'vector-bezier' as const,
        tag: 'WEB',
        desc: 'Free browser-based 3D design — Export → GLTF/GLB with one click',
        url: 'https://spline.design',
    },
    {
        name: 'Sketchfab (Web)',
        icon: 'earth' as const,
        tag: 'DOWNLOAD',
        desc: 'Download free furniture & room GLB models (filter by "downloadable")',
        url: 'https://sketchfab.com/features/gltf',
    },
];

// ── format bytes ─────────────────────────────────────────────────────────────
function fmtSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ModelManagerScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { projectId, projectName } = useLocalSearchParams<{ projectId: string; projectName: string }>();
    const [models, setModels] = useState<ModelAsset[]>([]);
    const [uploading, setUploading] = useState(false);

    useFocusEffect(useCallback(() => {
        if (user?.email && projectId) {
            getProjectModels(user.email, projectId).then(setModels);
        }
    }, [user?.email, projectId]));

    // ── Pick & copy GLB ────────────────────────────────────────────────────
    const handlePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],   // some OSes don't have model/gltf-binary mime
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (result.canceled || !result.assets?.length) return;

            const asset = result.assets[0];
            const isGlb = asset.name?.toLowerCase().endsWith('.glb') ||
                asset.name?.toLowerCase().endsWith('.gltf');
            if (!isGlb) {
                Alert.alert('Unsupported format', 'Please pick a .glb or .gltf file.');
                return;
            }

            setUploading(true);
            // copyToCacheDirectory:true means the URI is already in the app cache
            // and accessible for the lifetime of the app — no manual copy needed.
            const model: ModelAsset = {
                id: `${Date.now()}`,
                name: asset.name ?? 'Model',
                uri: asset.uri,          // already a stable cache:// URI
                size: asset.size ?? undefined,
                addedAt: new Date().toISOString(),
            };

            const next = await addProjectModel(user!.email, projectId!, model);
            setModels(next);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Could not import the model.');
        } finally {
            setUploading(false);
        }
    };

    // ── Delete model ──────────────────────────────────────────────────────
    const handleDelete = (id: string) => {
        Alert.alert('Remove Model', 'Delete this model from the project?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const updated = models.filter(m => m.id !== id);
                    await setProjectModels(user!.email, projectId!, updated);
                    setModels(updated);
                },
            },
        ]);
    };

    // ── Launch viewer / AR ────────────────────────────────────────────────
    const launchViewer = (model: ModelAsset) => {
        router.push({
            pathname: '/model-viewer',
            params: { uri: model.uri, name: model.name },
        } as any);
    };

    const launchAR = (model: ModelAsset) => {
        // ar-place handles Expo Go / dev-build detection internally
        router.push({
            pathname: '/ar-place',
            params: { uri: model.uri, name: model.name },
        } as any);
    };

    return (
        <View style={s.root}>
            {/* ── Header ── */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMain} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.headerSub}>MODELS</Text>
                    <Text style={s.headerTitle} numberOfLines={1}>{projectName ?? 'Project'}</Text>
                </View>
                <TouchableOpacity style={s.uploadBtn} onPress={handlePick} disabled={uploading}>
                    <MaterialCommunityIcons name={uploading ? 'loading' : 'upload'} size={18} color={Colors.primary} />
                    <Text style={s.uploadTxt}>{uploading ? 'Importing…' : 'Add .glb'}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={models}
                keyExtractor={m => m.id}
                contentContainerStyle={models.length === 0 ? s.emptyContainer : s.list}
                ListHeaderComponent={models.length > 0 ? (
                    <Text style={s.listHint}>Tap a model to view in 3D or place it in AR.</Text>
                ) : null}
                ListEmptyComponent={<EmptyGuide tools={AR_TOOLS} />}
                renderItem={({ item }) => (
                    <Surface style={mc.card} elevation={2}>
                        <View style={mc.icon}>
                            <MaterialCommunityIcons name="cube-outline" size={28} color={Colors.accentGold} />
                        </View>
                        <View style={mc.info}>
                            <Text style={mc.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={mc.meta}>{fmtSize(item.size)} · {new Date(item.addedAt).toLocaleDateString()}</Text>
                            <View style={mc.btnRow}>
                                <TouchableOpacity style={mc.btn} onPress={() => launchViewer(item)} activeOpacity={0.8}>
                                    <MaterialCommunityIcons name="rotate-3d-variant" size={14} color={Colors.accentGold} />
                                    <Text style={mc.btnTxt}>View 3D</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[mc.btn, mc.btnAR]} onPress={() => launchAR(item)} activeOpacity={0.8}>
                                    <MaterialCommunityIcons name="augmented-reality" size={14} color={Colors.primary} />
                                    <Text style={[mc.btnTxt, { color: Colors.primary }]}>Place in AR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </Surface>
                )}
            />
        </View>
    );
}

// ── Empty state: creation guide ───────────────────────────────────────────────
function EmptyGuide({ tools }: { tools: typeof AR_TOOLS }) {
    return (
        <View style={eg.root}>
            <MaterialCommunityIcons name="cube-off-outline" size={60} color={Colors.borderSubtle} />
            <Text style={eg.title}>No Models Yet</Text>
            <Text style={eg.sub}>Upload a .glb or .gltf 3D model to visualize it in AR or as a 3D preview.</Text>

            {/* ── Unity Spotlight ── */}
            <TouchableOpacity
                style={eg.unityCard}
                onPress={() => Linking.openURL('https://unity.com/download')}
                activeOpacity={0.85}
            >
                <View style={eg.unityLeft}>
                    <MaterialCommunityIcons name="gamepad-variant" size={28} color="#00C4CC" />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={eg.unityTitle}>Unity AR Workflow</Text>
                        <View style={eg.bestTag}><Text style={eg.bestTagTxt}>RECOMMENDED</Text></View>
                    </View>
                    <Text style={eg.unityDesc}>
                        {'1. Build your scene in Unity\n'}
                        {'2. Install "glTFast" from Package Manager\n'}
                        {'3. File → Export → glTF 2.0 (.glb)\n'}
                        {'4. Transfer .glb to phone → Add above'}
                    </Text>
                </View>
                <MaterialCommunityIcons name="open-in-new" size={14} color={Colors.textMuted} />
            </TouchableOpacity>

            <Text style={eg.guideTitle}>MORE TOOLS</Text>
            {tools.slice(1).map(t => (
                <TouchableOpacity key={t.name} style={eg.tool} onPress={() => Linking.openURL(t.url)} activeOpacity={0.8}>
                    <View style={eg.toolIcon}>
                        <MaterialCommunityIcons name={t.icon} size={20} color={Colors.accentGold} />
                    </View>
                    <View style={eg.toolText}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={eg.toolName}>{t.name}</Text>
                            {(t as any).tag && (
                                <View style={eg.tag}><Text style={eg.tagTxt}>{(t as any).tag}</Text></View>
                            )}
                        </View>
                        <Text style={eg.toolDesc}>{t.desc}</Text>
                    </View>
                    <MaterialCommunityIcons name="open-in-new" size={14} color={Colors.textMuted} />
                </TouchableOpacity>
            ))}

            <Surface style={eg.tipBox} elevation={0}>
                <Text style={eg.tipTitle}>⚡ Quickest Paths</Text>
                <Text style={eg.tipBody}>
                    <Text style={{ color: '#00C4CC' }}>Unity</Text>
                    {' → glTFast → Export .glb → Add here\n\n'}
                    <Text style={{ color: Colors.accentGold }}>Polycam</Text>
                    {' → Scan room → Export .glb → Add here\n\n'}
                    <Text style={{ color: '#A0E080' }}>Sketchfab</Text>
                    {' → Browse free models → Download .glb → Add here'}
                </Text>
            </Surface>
        </View>
    );
}


const s = StyleSheet.create({
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
    headerSub: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
    headerTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 20 },
    uploadBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.accentGold, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
    },
    uploadTxt: { color: Colors.primary, fontFamily: 'Lato-Bold', fontSize: 13 },
    list: { padding: 16, paddingBottom: 60 },
    listHint: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 13, marginBottom: 16, textAlign: 'center' },
    emptyContainer: { flex: 1 },
});

const mc = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        backgroundColor: Colors.card, borderRadius: 14, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: Colors.borderSubtle,
    },
    icon: {
        width: 52, height: 52, borderRadius: 12,
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
        alignItems: 'center', justifyContent: 'center',
    },
    info: { flex: 1 },
    name: { color: Colors.textMain, fontFamily: 'Lato-Bold', fontSize: 15, marginBottom: 2 },
    meta: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 12, marginBottom: 10 },
    btnRow: { flexDirection: 'row', gap: 8 },
    btn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
        borderWidth: 1, borderColor: Colors.accentGold,
    },
    btnAR: { backgroundColor: Colors.accentGold, borderColor: Colors.accentGold },
    btnTxt: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 12 },
});

const eg = StyleSheet.create({
    root: { padding: 24, paddingBottom: 60, alignItems: 'center' },
    title: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 22, marginTop: 12, marginBottom: 8 },
    sub: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    guideTitle: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, alignSelf: 'flex-start' },
    tool: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.card, borderRadius: 12, padding: 14,
        marginBottom: 10, borderWidth: 1, borderColor: Colors.borderSubtle, width: '100%',
    },
    toolIcon: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: 'rgba(212,175,55,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    toolText: { flex: 1 },
    toolName: { color: Colors.textMain, fontFamily: 'Lato-Bold', fontSize: 14, marginBottom: 2 },
    toolDesc: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 12, lineHeight: 18 },
    // Unity spotlight card
    unityCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        backgroundColor: 'rgba(0,196,204,0.07)',
        borderRadius: 14, padding: 16, marginBottom: 20, width: '100%',
        borderWidth: 1, borderColor: 'rgba(0,196,204,0.3)',
    },
    unityLeft: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: 'rgba(0,196,204,0.12)',
        borderWidth: 1, borderColor: 'rgba(0,196,204,0.3)',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    unityTitle: { color: Colors.textMain, fontFamily: 'Lato-Bold', fontSize: 14 },
    unityDesc: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 12, lineHeight: 20 },
    bestTag: {
        backgroundColor: '#00C4CC', borderRadius: 6,
        paddingHorizontal: 6, paddingVertical: 2,
    },
    bestTagTxt: { color: '#000', fontFamily: 'Lato-Bold', fontSize: 9, letterSpacing: 0.5 },
    // Generic tag badge
    tag: {
        backgroundColor: 'rgba(212,175,55,0.18)', borderRadius: 6,
        paddingHorizontal: 6, paddingVertical: 2,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
    },
    tagTxt: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 9, letterSpacing: 0.5 },
    tipBox: {
        marginTop: 24, padding: 18, borderRadius: 14, width: '100%',
        backgroundColor: 'rgba(212,175,55,0.07)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
    },
    tipTitle: { color: Colors.accentGold, fontFamily: 'Lato-Bold', fontSize: 14, marginBottom: 10 },
    tipBody: { color: Colors.textMain, fontFamily: 'Lato-Regular', fontSize: 13, lineHeight: 22 },
});
