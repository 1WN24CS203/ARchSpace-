import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { getUserProjects, setUserProjects } from '@/services/userStore';
import type { Project, RoomType, StyleTheme, LightingType, FlooringType, WallFinish } from '@/models/Project';

function ChipGroup<T extends string>({ label, options, selected, onSelect }: { label: string; options: T[]; selected: T | null; onSelect: (v: T) => void }) {
    return (
        <View style={{ marginBottom: 20 }}>
            <Text style={s.chipLabel}>{label}</Text>
            <View style={s.chipRow}>
                {options.map(o => (
                    <TouchableOpacity key={o} style={[s.chip, selected === o && s.chipActive]} onPress={() => onSelect(o)} activeOpacity={0.7}>
                        <Text style={[s.chipTxt, selected === o && s.chipTxtActive]}>{o}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const DORMANCY_OPTIONS = [
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
];

export default function EditProjectScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [name, setName] = useState('');
    const [clientName, setClientName] = useState('');
    const [budget, setBudget] = useState('');
    const [rooms, setRooms] = useState('');
    const [roomType, setRoomType] = useState<RoomType | null>(null);
    const [styleTheme, setStyleTheme] = useState<StyleTheme | null>(null);
    const [lighting, setLighting] = useState<LightingType | null>(null);
    const [flooring, setFlooring] = useState<FlooringType | null>(null);
    const [wallFinish, setWallFinish] = useState<WallFinish | null>(null);
    const [ceilingH, setCeilingH] = useState('');
    const [roomLen, setRoomLen] = useState('');
    const [roomWid, setRoomWid] = useState('');
    const [furnitureStyle, setFurnitureStyle] = useState('');
    const [notes, setNotes] = useState('');
    const [dormancyDays, setDormancyDays] = useState(90);
    const [status, setStatus] = useState<Project['status']>('planning');

    useEffect(() => {
        async function load() {
            if (!user?.email || !id) return;
            const all = await getUserProjects(user.email);
            const p = all.find(x => x.id === id);
            if (!p) return;
            setProject(p);
            setName(p.name);
            setClientName(p.clientName);
            setBudget(String(p.estimatedBudget));
            setRooms(String(p.rooms));
            setStatus(p.status);
            const ar = p.arParams;
            if (ar) {
                setRoomType(ar.roomType);
                setStyleTheme(ar.styleTheme);
                setLighting(ar.lighting);
                setFlooring(ar.flooring);
                setWallFinish(ar.wallFinish);
                setCeilingH(String(ar.ceilingHeight));
                setRoomLen(String(ar.roomLength));
                setRoomWid(String(ar.roomWidth));
                setFurnitureStyle(ar.furnitureStyle || '');
                setNotes(ar.notes || '');
            }
            if (p.dormantAt) {
                const remaining = Math.ceil((new Date(p.dormantAt).getTime() - Date.now()) / 86400000);
                const closest = DORMANCY_OPTIONS.reduce((a, b) => Math.abs(b.days - remaining) < Math.abs(a.days - remaining) ? b : a);
                setDormancyDays(closest.days);
            }
        }
        load();
    }, [id, user?.email]);

    const handleSave = async () => {
        if (!user?.email || !project) return;
        setSaving(true);
        try {
            const all = await getUserProjects(user.email);
            const updated = all.map(p => p.id !== id ? p : {
                ...p,
                name: name.trim() || p.name,
                clientName: clientName.trim() || p.clientName,
                estimatedBudget: Number(budget) || p.estimatedBudget,
                rooms: Number(rooms) || p.rooms,
                status,
                dormantAt: new Date(Date.now() + dormancyDays * 86400000).toISOString(),
                arParams: {
                    ...p.arParams,
                    roomType: roomType ?? p.arParams?.roomType,
                    styleTheme: styleTheme ?? p.arParams?.styleTheme,
                    lighting: lighting ?? p.arParams?.lighting,
                    flooring: flooring ?? p.arParams?.flooring,
                    wallFinish: wallFinish ?? p.arParams?.wallFinish,
                    ceilingHeight: Number(ceilingH) || p.arParams?.ceilingHeight,
                    roomLength: Number(roomLen) || p.arParams?.roomLength,
                    roomWidth: Number(roomWid) || p.arParams?.roomWidth,
                    furnitureStyle,
                    notes,
                } as any,
            });
            await setUserProjects(user.email, updated);
            router.back();
        } catch {
            Alert.alert('Error', 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    if (!project) {
        return <View style={s.root}><Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 80 }}>Loading…</Text></View>;
    }

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMain} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Edit Project</Text>
                <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                    <Text style={s.saveTxt}>{saving ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Project Info */}
                <Text style={s.sectionLabel}>PROJECT DETAILS</Text>
                <TextInput label="Project Name" value={name} onChangeText={setName} style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />
                <TextInput label="Client Name" value={clientName} onChangeText={setClientName} style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />
                <TextInput label="Budget (₹)" value={budget} onChangeText={setBudget} keyboardType="numeric" style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />
                <TextInput label="Number of Rooms" value={rooms} onChangeText={setRooms} keyboardType="numeric" style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />

                {/* Status */}
                <Text style={s.sectionLabel}>STATUS</Text>
                <View style={s.chipRow}>
                    {(['planning', 'in_progress', 'completed'] as Project['status'][]).map(st => (
                        <TouchableOpacity key={st} style={[s.chip, status === st && s.chipActive]} onPress={() => setStatus(st)} activeOpacity={0.7}>
                            <Text style={[s.chipTxt, status === st && s.chipTxtActive]}>{st.replace('_', ' ')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Dormancy */}
                <Text style={[s.sectionLabel, { marginTop: 20 }]}>DORMANCY PERIOD</Text>
                <View style={s.chipRow}>
                    {DORMANCY_OPTIONS.map(o => (
                        <TouchableOpacity key={o.days} style={[s.chip, dormancyDays === o.days && s.chipActive]} onPress={() => setDormancyDays(o.days)} activeOpacity={0.7}>
                            <Text style={[s.chipTxt, dormancyDays === o.days && s.chipTxtActive]}>{o.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* AR Params */}
                <Text style={[s.sectionLabel, { marginTop: 20 }]}>AR DESIGN PARAMETERS</Text>
                <ChipGroup<RoomType> label="Room Type" options={['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room', 'Other']} selected={roomType} onSelect={setRoomType} />
                <ChipGroup<StyleTheme> label="Design Style" options={['Modern', 'Minimalist', 'Industrial', 'Scandinavian', 'Bohemian', 'Classic', 'Art Deco']} selected={styleTheme} onSelect={setStyleTheme} />
                <ChipGroup<LightingType> label="Lighting" options={['Warm', 'Cool', 'Natural', 'Accent', 'Ambient']} selected={lighting} onSelect={setLighting} />
                <ChipGroup<FlooringType> label="Flooring" options={['Hardwood', 'Marble', 'Tiles', 'Carpet', 'Concrete', 'Laminate']} selected={flooring} onSelect={setFlooring} />
                <ChipGroup<WallFinish> label="Wall Finish" options={['Paint', 'Wallpaper', 'Exposed Brick', 'Wood Paneling', 'Stone', 'Plaster']} selected={wallFinish} onSelect={setWallFinish} />

                <Text style={s.sectionLabel}>DIMENSIONS (ft)</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}><TextInput label="Length" value={roomLen} onChangeText={setRoomLen} keyboardType="decimal-pad" style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} /></View>
                    <View style={{ flex: 1 }}><TextInput label="Width" value={roomWid} onChangeText={setRoomWid} keyboardType="decimal-pad" style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} /></View>
                </View>
                <TextInput label="Ceiling Height" value={ceilingH} onChangeText={setCeilingH} keyboardType="decimal-pad" style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />

                <TextInput label="Furniture Style" value={furnitureStyle} onChangeText={setFurnitureStyle} style={s.input} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />
                <TextInput label="Designer Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={[s.input, { minHeight: 100 }]} textColor={Colors.textMain} activeUnderlineColor={Colors.accentGold} theme={{ colors: { onSurfaceVariant: Colors.textMuted } }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.primary },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
        backgroundColor: Colors.secondary, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    backBtn: { padding: 4 },
    headerTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 20 },
    saveBtn: { backgroundColor: Colors.accentGold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    saveTxt: { color: Colors.primary, fontFamily: 'Lato-Bold', fontSize: 13 },
    scroll: { padding: 20, paddingBottom: 60 },
    sectionLabel: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
    input: { backgroundColor: Colors.secondary, marginBottom: 14 },
    chipLabel: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderSubtle },
    chipActive: { backgroundColor: Colors.accentGold, borderColor: Colors.accentGold },
    chipTxt: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 13 },
    chipTxtActive: { color: Colors.primary, fontFamily: 'Lato-Bold' },
});
