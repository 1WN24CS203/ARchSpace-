import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

type UnityMsg = {
    type?: 'budget' | 'category' | 'item' | 'items';
    budget?: number;
    category?: string;
    item?: string;
    items?: Array<{ name: string; price: number; category: string }>;
};

const CATEGORIES = ['Structure', 'Material', 'Furniture', 'Lighting'] as const;

type UnityViewRef = {
    postMessage: (gameObject: string, methodName: string, message: string) => void;
};

const IS_EXPO_GO = Constants.appOwnership === 'expo';
const UI_DEMO_ONLY = (__DEV__ && process.env.EXPO_PUBLIC_UI_DEMO_ONLY !== '0') || IS_EXPO_GO;

const DEMO_ITEMS: Record<(typeof CATEGORIES)[number], Array<{ name: string; price: number; category: string }>> = {
    Structure: [
        { name: 'Wall Panel', price: 1800, category: 'Structure' },
        { name: 'Door Frame', price: 2200, category: 'Structure' },
        { name: 'Window', price: 1600, category: 'Structure' },
    ],
    Material: [
        { name: 'Oak Floor', price: 1200, category: 'Material' },
        { name: 'Marble Tile', price: 2000, category: 'Material' },
        { name: 'Matte Paint', price: 800, category: 'Material' },
    ],
    Furniture: [
        { name: 'Sofa', price: 14500, category: 'Furniture' },
        { name: 'Coffee Table', price: 6200, category: 'Furniture' },
        { name: 'Chair', price: 3200, category: 'Furniture' },
    ],
    Lighting: [
        { name: 'Pendant', price: 2400, category: 'Lighting' },
        { name: 'Floor Lamp', price: 3100, category: 'Lighting' },
        { name: 'Spotlight', price: 900, category: 'Lighting' },
    ],
};

export default function ARPreviewScreen() {
    const router = useRouter();
    const unityRef = useRef<UnityViewRef | null>(null);

    const UnityView = useMemo(() => {
        if (UI_DEMO_ONLY) return null;
        try {
            const mod = require('@azesmway/react-native-unity');
            return mod?.default ?? mod;
        } catch {
            return null;
        }
    }, []);

    const [budget, setBudget] = useState<number>(0);
    const [activeCategory, setActiveCategory] = useState<string>('Material');
    const [activeItem, setActiveItem] = useState<string>('');
    const [items, setItems] = useState<Array<{ name: string; price: number; category: string }>>([]);

    const swatches = useMemo(
        () => items.slice(0, 12),
        [items]
    );

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
        }).start();

        if (UI_DEMO_ONLY || !UnityView || Platform.OS === 'web') {
            const demo = DEMO_ITEMS[activeCategory as (typeof CATEGORIES)[number]] ?? [];
            setItems(demo);
            setActiveItem(demo[0]?.name ?? '');
            setBudget(45000);
            return;
        }

        const ref = unityRef.current;
        if (!ref) return;

        ref.postMessage('RNBridge', 'EnableRNMode', '');
        ref.postMessage('RNBridge', 'RequestState', '');
        ref.postMessage('RNBridge', 'RequestItemsForCategory', activeCategory);
    }, []);

    useEffect(() => {
        if (UI_DEMO_ONLY || !UnityView || Platform.OS === 'web') {
            const demo = DEMO_ITEMS[activeCategory as (typeof CATEGORIES)[number]] ?? [];
            setItems(demo);
            setActiveItem(demo[0]?.name ?? '');
            return;
        }

        unityRef.current?.postMessage('RNBridge', 'SetCategory', activeCategory);
        unityRef.current?.postMessage('RNBridge', 'RequestItemsForCategory', activeCategory);
    }, [activeCategory]);

    const onUnityMessage = (event: any) => {
        const raw = event?.nativeEvent?.message;
        if (typeof raw !== 'string') return;

        let parsed: UnityMsg | null = null;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return;
        }

        if (!parsed?.type) return;

        if (parsed.type === 'budget' && typeof parsed.budget === 'number') {
            setBudget(parsed.budget);
        }
        if (parsed.type === 'category' && typeof parsed.category === 'string') {
            setActiveCategory(parsed.category);
        }
        if (parsed.type === 'item' && typeof parsed.item === 'string') {
            setActiveItem(parsed.item);
        }
        if (parsed.type === 'items' && Array.isArray(parsed.items)) {
            setItems(parsed.items);
            if (parsed.items.length > 0 && !activeItem) {
                setActiveItem(parsed.items[0].name);
            }
        }
    };

    return (
        <View style={styles.container}>
            {UnityView ? (
                <UnityView
                    ref={unityRef}
                    style={styles.unity}
                    fullScreen
                    onUnityMessage={onUnityMessage}
                />
            ) : (
                <View style={styles.unityPlaceholder}>
                    <MaterialCommunityIcons name="augmented-reality" size={64} color={Colors.textMuted} opacity={0.5} />
                    <Text style={styles.placeholderText}>AR Engine Offline (Demo Mode)</Text>
                </View>
            )}

            {/* top HUD */}
            <View style={styles.topHud} pointerEvents="box-none">
                <Pressable style={styles.iconBtn} onPress={() => router.back()}>
                    <Feather name="chevron-left" size={24} color={Colors.textMain} />
                </Pressable>

                <View style={styles.budgetPill}>
                    <Text style={styles.budgetText}>Est. Cost</Text>
                    <Text style={styles.budgetValue}>${budget.toFixed(0)}</Text>
                </View>
            </View>

            {/* bottom sheet */}
            <Animated.View style={[styles.sheet, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [50, 0] }) }] }]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>{activeCategory.toUpperCase()}</Text>
                    <Pressable
                        style={styles.sheetClose}
                        onPress={() => {
                            if (UI_DEMO_ONLY || !UnityView) {
                                setActiveItem('');
                                return;
                            }
                            unityRef.current?.postMessage('RNBridge', 'Deselect', '');
                        }}
                    >
                        <Feather name="x" size={18} color={Colors.textMain} />
                    </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                    {CATEGORIES.map((c) => (
                        <Pressable
                            key={c}
                            onPress={() => setActiveCategory(c)}
                            style={[styles.categoryChip, activeCategory === c ? styles.categoryChipActive : null]}
                        >
                            <Text style={[styles.categoryChipText, activeCategory === c ? styles.categoryChipTextActive : null]}>
                                {c}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchRow}>
                    {swatches.map((sw) => (
                        <Pressable
                            key={sw.name}
                            style={styles.swatch}
                            onPress={() => {
                                setActiveItem(sw.name);
                                if (UI_DEMO_ONLY || !UnityView) {
                                    setBudget((b) => Math.max(0, b - sw.price));
                                    return;
                                }
                                unityRef.current?.postMessage('RNBridge', 'SetItem', sw.name);
                            }}
                        >
                            <View style={[styles.swatchInner, activeItem === sw.name ? styles.swatchInnerActive : null]}>
                                <Text style={styles.swatchInitials}>{sw.name.slice(0,2).toUpperCase()}</Text>
                            </View>
                            <Text style={styles.swatchName} numberOfLines={1}>{sw.name}</Text>
                            <Text style={styles.swatchPrice}>${sw.price}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <View style={styles.actionsRow}>
                    <Pressable
                        style={styles.sideAction}
                        onPress={() => {
                            if (UI_DEMO_ONLY || !UnityView) {
                                setBudget((b) => b + 500);
                                return;
                            }
                            unityRef.current?.postMessage('RNBridge', 'Undo', '');
                        }}
                    >
                        <Feather name="rotate-ccw" size={20} color={Colors.textMain} />
                    </Pressable>

                    <Pressable
                        style={styles.primaryAction}
                        onPress={() => {
                            if (UI_DEMO_ONLY || !UnityView) return;
                            unityRef.current?.postMessage('RNBridge', 'Ping', 'PrimaryAction');
                        }}
                    >
                        <MaterialCommunityIcons name="plus" size={32} color="#111" />
                    </Pressable>

                    <Pressable
                        style={styles.sideAction}
                        onPress={() => {
                            if (UI_DEMO_ONLY || !UnityView) {
                                setBudget(45000);
                                return;
                            }
                            unityRef.current?.postMessage('RNBridge', 'Clear', '');
                        }}
                    >
                        <Feather name="trash-2" size={20} color={Colors.textMain} />
                    </Pressable>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    unity: {
        flex: 1,
    },
    unityPlaceholder: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        marginTop: 12,
        fontSize: 16,
    },

    topHud: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    budgetPill: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    budgetText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontFamily: 'Lato-Bold',
        letterSpacing: 0.5,
    },
    budgetValue: {
        color: Colors.accentGoldHover,
        fontSize: 16,
        fontFamily: 'PlayfairDisplay-Regular',
        fontWeight: '700',
    },

    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 24,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sheetTitle: {
        color: Colors.textMain,
        fontSize: 18,
        fontFamily: 'PlayfairDisplay-Regular',
        letterSpacing: 1,
    },
    sheetClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    categoryRow: {
        paddingHorizontal: 20,
        marginBottom: 12,
        height: 50,
        alignItems: 'center',
        gap: 12,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    categoryChipText: {
        color: Colors.textMuted,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
    },
    categoryChipTextActive: {
        color: Colors.accentGoldHover,
        fontFamily: 'Lato-Bold',
    },

    swatchRow: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 16,
        marginBottom: 20,
    },
    swatch: {
        width: 80,
        alignItems: 'center',
    },
    swatchInner: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    swatchInnerActive: {
        borderColor: Colors.accentGoldHover,
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        shadowColor: Colors.accentGoldHover,
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    swatchInitials: {
        color: Colors.textMuted,
        fontFamily: 'PlayfairDisplay-Regular',
        fontSize: 24,
        opacity: 0.8,
    },
    swatchName: {
        color: Colors.textMain,
        fontSize: 12,
        fontFamily: 'Lato-Regular',
        textAlign: 'center',
        marginBottom: 2,
    },
    swatchPrice: {
        color: Colors.textMuted,
        fontSize: 11,
        fontFamily: 'Lato-Regular',
    },

    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 32,
    },
    sideAction: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryAction: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.accentGold,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.accentGold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
});
