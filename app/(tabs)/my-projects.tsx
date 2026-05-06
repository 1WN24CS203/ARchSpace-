import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { getUserProjects, setUserProjects } from '@/services/userStore';
import type { Project } from '@/models/Project';

const STATUS_META: Record<string, { color: string; icon: string; label: string }> = {
    planning:    { color: '#7C9EFF', icon: 'clipboard-text',     label: 'Planning'    },
    in_progress: { color: Colors.accentGold, icon: 'progress-wrench', label: 'In Progress' },
    completed:   { color: '#4CAF50', icon: 'check-circle',       label: 'Completed'   },
    dormant:     { color: Colors.textMuted, icon: 'moon-waning-crescent', label: 'Dormant'    },
};

function daysLeft(dormantAt: string): number {
    return Math.max(0, Math.ceil((new Date(dormantAt).getTime() - Date.now()) / 86400000));
}

function resolveStatus(p: Project): Project['status'] {
    if (p.status === 'completed') return 'completed';
    if (p.dormantAt && new Date(p.dormantAt) < new Date()) return 'dormant';
    return p.status;
}

export default function MyProjectsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!user?.email) return;
        const raw = await getUserProjects(user.email);
        // Auto-mark dormant
        const updated = raw.map(p => ({ ...p, status: resolveStatus(p) }));
        setProjects(updated);
        // Persist any auto-dormant changes
        if (updated.some((p, i) => p.status !== raw[i].status)) {
            await setUserProjects(user.email, updated);
        }
    }, [user?.email]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Project', 'Remove this project permanently?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    if (!user?.email) return;
                    const updated = projects.filter(p => p.id !== id);
                    await setUserProjects(user.email, updated);
                    setProjects(updated);
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: Project }) => {
        const status = resolveStatus(item);
        const meta = STATUS_META[status];
        const days = item.dormantAt ? daysLeft(item.dormantAt) : null;
        const budget = item.estimatedBudget.toLocaleString('en-IN');

        return (
            <Surface style={card.surface} elevation={2}>
                {/* Status bar accent */}
                <View style={[card.accent, { backgroundColor: meta.color }]} />

                <View style={card.body}>
                    {/* Top row */}
                    <View style={card.topRow}>
                        <View style={card.namePill}>
                            <MaterialCommunityIcons name={meta.icon as any} size={13} color={meta.color} />
                            <Text style={[card.statusTxt, { color: meta.color }]}>{meta.label}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Name */}
                    <Text style={card.title} numberOfLines={1}>{item.name}</Text>
                    <Text style={card.client} numberOfLines={1}>Client · {item.clientName}</Text>

                    {/* AR params chips */}
                    {item.arParams && (
                        <View style={card.chipRow}>
                            {[item.arParams.roomType, item.arParams.styleTheme, item.arParams.flooring].map((v, i) => (
                                <View key={i} style={card.chip}>
                                    <Text style={card.chipTxt}>{v}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Stats row */}
                    <View style={card.statsRow}>
                        <View style={card.stat}>
                            <MaterialCommunityIcons name="currency-inr" size={13} color={Colors.textMuted} />
                            <Text style={card.statTxt}>₹{budget}</Text>
                        </View>
                        <View style={card.stat}>
                            <MaterialCommunityIcons name="door" size={13} color={Colors.textMuted} />
                            <Text style={card.statTxt}>{item.rooms} {item.rooms === 1 ? 'room' : 'rooms'}</Text>
                        </View>
                        {days !== null && status !== 'dormant' && (
                            <View style={card.stat}>
                                <MaterialCommunityIcons name="clock-outline" size={13} color={days < 14 ? '#FF6B6B' : Colors.textMuted} />
                                <Text style={[card.statTxt, days < 14 && { color: '#FF6B6B' }]}>{days}d left</Text>
                            </View>
                        )}
                    </View>

                    {/* Edit & Models buttons */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                        <TouchableOpacity
                            style={[card.editBtn, { flex: 1 }]}
                            onPress={() => router.push({ pathname: '/edit-project', params: { id: item.id } } as any)}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="pencil" size={14} color={Colors.primary} />
                            <Text style={card.editTxt}>View / Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[card.editBtn, card.modelsBtn]}
                            onPress={() => router.push({ pathname: '/model-manager', params: { projectId: item.id, projectName: item.name } } as any)}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="cube-outline" size={14} color={Colors.accentGold} />
                            <Text style={[card.editTxt, { color: Colors.accentGold }]}>Models</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Surface>
        );
    };

    return (
        <View style={s.container}>
            <FlatList
                data={projects}
                keyExtractor={p => p.id}
                renderItem={renderItem}
                contentContainerStyle={projects.length === 0 ? s.empty : s.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentGold} />}
                ListEmptyComponent={
                    <View style={s.emptyBox}>
                        <MaterialCommunityIcons name="folder-open-outline" size={64} color={Colors.borderSubtle} />
                        <Text style={s.emptyTitle}>No Projects Yet</Text>
                        <Text style={s.emptyHint}>Tap &quot;New Project&quot; on the dashboard to get started.</Text>
                    </View>
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    list: { padding: 16, paddingBottom: 80 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyBox: { alignItems: 'center', gap: 12 },
    emptyTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 22, marginTop: 8 },
    emptyHint: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

const card = StyleSheet.create({
    surface: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
    },
    accent: { width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
    body: { flex: 1, padding: 16 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    namePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    statusTxt: { fontFamily: 'Lato-Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
    title: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 18, marginBottom: 3 },
    client: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 13, marginBottom: 12 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    chip: { backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    chipTxt: { color: Colors.accentGold, fontFamily: 'Lato-Regular', fontSize: 11 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statTxt: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 12 },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: Colors.accentGold, borderRadius: 8, paddingVertical: 9,
    },
    modelsBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1, borderColor: Colors.accentGold,
        paddingHorizontal: 16,
    },
    editTxt: { color: Colors.primary, fontFamily: 'Lato-Bold', fontSize: 13, letterSpacing: 0.5 },
});
