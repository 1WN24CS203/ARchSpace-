import React, { useState, useRef } from 'react';
import {
    View, ScrollView, StyleSheet, TouchableOpacity,
    Animated, Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { addUserProject } from '@/services/userStore';
import type { RoomType, StyleTheme, LightingType, FlooringType, WallFinish, ARDesignParams } from '@/models/Project';

// ── Chip selector ─────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({
    label, options, selected, onSelect,
}: { label: string; options: T[]; selected: T | null; onSelect: (v: T) => void }) {
    return (
        <View style={chip.wrapper}>
            <Text style={chip.label}>{label}</Text>
            <View style={chip.row}>
                {options.map(o => (
                    <TouchableOpacity
                        key={o}
                        style={[chip.item, selected === o && chip.itemActive]}
                        onPress={() => onSelect(o)}
                        activeOpacity={0.7}
                    >
                        <Text style={[chip.text, selected === o && chip.textActive]}>{o}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const chip = StyleSheet.create({
    wrapper: { marginBottom: 24 },
    label: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    item: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderSubtle, backgroundColor: 'transparent' },
    itemActive: { backgroundColor: Colors.accentGold, borderColor: Colors.accentGold },
    text: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 13 },
    textActive: { color: Colors.primary, fontFamily: 'Lato-Bold' },
});

// ── Number input ──────────────────────────────────────────────────────────────
function NumInput({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
    return (
        <View style={{ marginBottom: 16 }}>
            <TextInput
                label={suffix ? `${label} (${suffix})` : label}
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                style={inp.field}
                textColor={Colors.textMain}
                activeUnderlineColor={Colors.accentGold}
                theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
            />
        </View>
    );
}
const inp = StyleSheet.create({ field: { backgroundColor: Colors.primary } });

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
    return (
        <View style={sb.row}>
            {Array.from({ length: total }).map((_, i) => (
                <View key={i} style={[sb.dot, i < current && sb.done, i === current && sb.active]} />
            ))}
        </View>
    );
}
const sb = StyleSheet.create({
    row: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderSubtle },
    done: { backgroundColor: Colors.accentGold, width: 8 },
    active: { backgroundColor: Colors.accentGold, width: 24, borderRadius: 4 },
});

// ── Dormancy picker ───────────────────────────────────────────────────────────
const DORMANCY_OPTIONS = [
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
];

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

export default function NewProjectScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // ── Step 0: Basics
    const [projectName, setProjectName] = useState('');
    const [clientName, setClientName] = useState('');
    const [budget, setBudget] = useState('');
    const [dormancyDays, setDormancyDays] = useState(90);

    // ── Step 1: Room & Style
    const [roomType, setRoomType] = useState<RoomType | null>(null);
    const [styleTheme, setStyleTheme] = useState<StyleTheme | null>(null);
    const [rooms, setRooms] = useState('1');

    // ── Step 2: Materials
    const [lighting, setLighting] = useState<LightingType | null>(null);
    const [flooring, setFlooring] = useState<FlooringType | null>(null);
    const [wallFinish, setWallFinish] = useState<WallFinish | null>(null);

    // ── Step 3: Dimensions & Notes
    const [ceilingH, setCeilingH] = useState('9');
    const [roomLen, setRoomLen] = useState('');
    const [roomWid, setRoomWid] = useState('');
    const [furnitureStyle, setFurnitureStyle] = useState('');
    const [notes, setNotes] = useState('');

    const transition = (next: number) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            setStep(next);
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        });
    };

    const canNext = () => {
        if (step === 0) return projectName.trim().length > 0 && clientName.trim().length > 0 && Number(budget) > 0;
        if (step === 1) return !!roomType && !!styleTheme;
        if (step === 2) return !!lighting && !!flooring && !!wallFinish;
        return true;
    };

    const handleSave = async () => {
        if (!user?.email) return;
        setSaving(true);
        try {
            const arParams: ARDesignParams = {
                roomType: roomType!,
                styleTheme: styleTheme!,
                lighting: lighting!,
                flooring: flooring!,
                wallFinish: wallFinish!,
                ceilingHeight: Number(ceilingH) || 9,
                roomLength: Number(roomLen) || 0,
                roomWidth: Number(roomWid) || 0,
                colorPalette: [],
                furnitureStyle,
                notes,
            };
            const dormantAt = new Date(Date.now() + dormancyDays * 86400000).toISOString();
            await addUserProject(user.email, {
                id: `${Date.now()}`,
                name: projectName.trim(),
                clientName: clientName.trim(),
                rooms: Number(rooms) || 1,
                estimatedBudget: Number(budget),
                createdAt: new Date().toISOString(),
                dormantAt,
                status: 'planning',
                arParams,
            });
            router.replace('/(tabs)/my-projects' as any);
        } catch {
            Alert.alert('Error', 'Failed to save project. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const stepTitles = ['Project Basics', 'Room & Style', 'Materials', 'Dimensions & Notes'];
    const stepIcons: any[] = ['clipboard-text', 'sofa', 'texture-box', 'ruler'];

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => step === 0 ? router.back() : transition(step - 1)} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMain} />
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerSub}>STEP {step + 1} OF {TOTAL_STEPS}</Text>
                    <Text style={s.headerTitle}>{stepTitles[step]}</Text>
                </View>
                <View style={s.stepIcon}>
                    <MaterialCommunityIcons name={stepIcons[step]} size={20} color={Colors.accentGold} />
                </View>
            </View>

            <StepBar current={step} total={TOTAL_STEPS} />

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* ── STEP 0: Basics ── */}
                    {step === 0 && (
                        <View>
                            <Text style={s.sectionLabel}>PROJECT IDENTITY</Text>
                            <TextInput
                                label="Project Name"
                                value={projectName}
                                onChangeText={setProjectName}
                                style={s.input}
                                textColor={Colors.textMain}
                                activeUnderlineColor={Colors.accentGold}
                                theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                left={<TextInput.Icon icon="briefcase" color={Colors.textMuted} />}
                            />
                            <TextInput
                                label="Client Name"
                                value={clientName}
                                onChangeText={setClientName}
                                style={s.input}
                                textColor={Colors.textMain}
                                activeUnderlineColor={Colors.accentGold}
                                theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                left={<TextInput.Icon icon="account" color={Colors.textMuted} />}
                            />
                            <TextInput
                                label="Estimated Budget (₹)"
                                value={budget}
                                onChangeText={setBudget}
                                keyboardType="numeric"
                                style={s.input}
                                textColor={Colors.textMain}
                                activeUnderlineColor={Colors.accentGold}
                                theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                left={<TextInput.Icon icon="currency-inr" color={Colors.textMuted} />}
                            />

                            <Text style={s.sectionLabel}>SET DORMANCY</Text>
                            <Text style={s.hint}>Project becomes dormant after this period of inactivity.</Text>
                            <View style={chip.row}>
                                {DORMANCY_OPTIONS.map(o => (
                                    <TouchableOpacity
                                        key={o.days}
                                        style={[chip.item, dormancyDays === o.days && chip.itemActive]}
                                        onPress={() => setDormancyDays(o.days)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[chip.text, dormancyDays === o.days && chip.textActive]}>{o.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── STEP 1: Room & Style ── */}
                    {step === 1 && (
                        <View>
                            <NumInput label="Number of Rooms" value={rooms} onChange={setRooms} />
                            <ChipGroup<RoomType>
                                label="Primary Room Type"
                                options={['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room', 'Other']}
                                selected={roomType}
                                onSelect={setRoomType}
                            />
                            <ChipGroup<StyleTheme>
                                label="Design Style"
                                options={['Modern', 'Minimalist', 'Industrial', 'Scandinavian', 'Bohemian', 'Classic', 'Art Deco']}
                                selected={styleTheme}
                                onSelect={setStyleTheme}
                            />
                        </View>
                    )}

                    {/* ── STEP 2: Materials ── */}
                    {step === 2 && (
                        <View>
                            <ChipGroup<LightingType>
                                label="Lighting Type"
                                options={['Warm', 'Cool', 'Natural', 'Accent', 'Ambient']}
                                selected={lighting}
                                onSelect={setLighting}
                            />
                            <ChipGroup<FlooringType>
                                label="Flooring Material"
                                options={['Hardwood', 'Marble', 'Tiles', 'Carpet', 'Concrete', 'Laminate']}
                                selected={flooring}
                                onSelect={setFlooring}
                            />
                            <ChipGroup<WallFinish>
                                label="Wall Finish"
                                options={['Paint', 'Wallpaper', 'Exposed Brick', 'Wood Paneling', 'Stone', 'Plaster']}
                                selected={wallFinish}
                                onSelect={setWallFinish}
                            />
                        </View>
                    )}

                    {/* ── STEP 3: Dimensions & Notes ── */}
                    {step === 3 && (
                        <View>
                            <Text style={s.sectionLabel}>ROOM DIMENSIONS</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <NumInput label="Length" value={roomLen} onChange={setRoomLen} suffix="ft" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <NumInput label="Width" value={roomWid} onChange={setRoomWid} suffix="ft" />
                                </View>
                            </View>
                            <NumInput label="Ceiling Height" value={ceilingH} onChange={setCeilingH} suffix="ft" />

                            <Text style={s.sectionLabel}>AR MODEL PREFERENCES</Text>
                            <TextInput
                                label="Furniture Style / References"
                                value={furnitureStyle}
                                onChangeText={setFurnitureStyle}
                                style={[s.input, { marginBottom: 16 }]}
                                textColor={Colors.textMain}
                                activeUnderlineColor={Colors.accentGold}
                                theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                placeholder="e.g. Mid-century modern, IKEA minimal…"
                                placeholderTextColor={Colors.borderSubtle}
                                left={<TextInput.Icon icon="sofa" color={Colors.textMuted} />}
                            />
                            <TextInput
                                label="Designer Notes"
                                value={notes}
                                onChangeText={setNotes}
                                style={[s.input, { minHeight: 100 }]}
                                textColor={Colors.textMain}
                                activeUnderlineColor={Colors.accentGold}
                                theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                multiline
                                numberOfLines={4}
                                left={<TextInput.Icon icon="note-text" color={Colors.textMuted} />}
                            />
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Footer CTA */}
            <View style={s.footer}>
                {step < TOTAL_STEPS - 1 ? (
                    <TouchableOpacity
                        style={[s.cta, !canNext() && s.ctaDisabled]}
                        onPress={() => canNext() && transition(step + 1)}
                        activeOpacity={0.85}
                    >
                        <Text style={s.ctaText}>Continue</Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[s.cta, saving && s.ctaDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.85}
                    >
                        <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />
                        <Text style={s.ctaText}>{saving ? 'Saving…' : 'Create Project'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.primary },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
        backgroundColor: Colors.secondary,
        borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    },
    backBtn: { padding: 4, marginRight: 12 },
    headerCenter: { flex: 1 },
    headerSub: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
    headerTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 22, marginTop: 2 },
    stepIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(212,175,55,0.12)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
    },
    scroll: { padding: 24, paddingBottom: 40 },
    sectionLabel: {
        color: Colors.textMuted, fontFamily: 'Lato-Regular',
        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14,
    },
    hint: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 13, marginBottom: 14, lineHeight: 20 },
    input: {
        backgroundColor: Colors.secondary,
        marginBottom: 16,
        borderTopLeftRadius: 8, borderTopRightRadius: 8,
    },
    footer: {
        paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        paddingTop: 16,
        backgroundColor: Colors.secondary,
        borderTopWidth: 1, borderTopColor: Colors.borderSubtle,
    },
    cta: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: Colors.accentGold,
        borderRadius: 12, paddingVertical: 16,
    },
    ctaDisabled: { opacity: 0.4 },
    ctaText: { color: Colors.primary, fontFamily: 'Lato-Bold', fontSize: 15, letterSpacing: 1 },
});
