import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';

type UnityMsg = {
    type?: 'budget' | 'category' | 'item' | 'items';
    budget?: number;
    category?: string;
    item?: string;
    items?: { name: string; price: number; category: string }[];
};

const CATEGORIES = ['Structure', 'Material', 'Furniture', 'Lighting'] as const;

type UnityViewRef = {
    postMessage: (gameObject: string, methodName: string, message: string) => void;
};

const IS_EXPO_GO = Constants.appOwnership === 'expo';
const UI_DEMO_ONLY = (__DEV__ && process.env.EXPO_PUBLIC_UI_DEMO_ONLY !== '0') || IS_EXPO_GO;

const DEMO_ITEMS: Record<(typeof CATEGORIES)[number], { name: string; price: number; category: string }[]> = {
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

    const [UnityView, setUnityView] = useState<any>(null);

    const [budget, setBudget] = useState<number>(0);
    const [activeCategory, setActiveCategory] = useState<string>('Material');
    const [activeItem, setActiveItem] = useState<string>('');
    const [items, setItems] = useState<{ name: string; price: number; category: string }[]>([]);

    const swatches = useMemo(
        () => items.slice(0, 12),
        [items]
    );

    useEffect(() => {
        if (UI_DEMO_ONLY) return;

        let cancelled = false;
        import('@azesmway/react-native-unity')
            .then((mod) => {
                if (cancelled) return;
                setUnityView(() => (mod as any)?.default ?? mod);
            })
            .catch(() => {
                // Keep UnityView null; UI will render demo.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        // Default budget in demo mode for UI testing.
        if (UI_DEMO_ONLY || Platform.OS === 'web') {
            setBudget(45000);
        }
    }, []);

    useEffect(() => {
        // Run mock data setup on web as well
        if (UI_DEMO_ONLY || !UnityView || Platform.OS === 'web') {
            const demo = DEMO_ITEMS[activeCategory as (typeof CATEGORIES)[number]] ?? [];
            setItems(demo);
            setActiveItem(demo[0]?.name ?? '');
            return;
        }

        unityRef.current?.postMessage('RNBridge', 'SetCategory', activeCategory);
        unityRef.current?.postMessage('RNBridge', 'RequestItemsForCategory', activeCategory);
    }, [UnityView, activeCategory]);

    useEffect(() => {
        if (UI_DEMO_ONLY || !UnityView || Platform.OS === 'web') return;

        const ref = unityRef.current;
        if (!ref) return;

        // Ensure Unity disables any legacy UI and acts as AR engine only.
        ref.postMessage('RNBridge', 'EnableRNMode', '');
        ref.postMessage('RNBridge', 'RequestState', '');
    }, [UnityView]);

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
                <View style={styles.unity} />
            )}

            {/* top HUD */}
            <View style={styles.topHud} pointerEvents="box-none">
                <Pressable style={styles.iconBtn} onPress={() => router.back()}>
                    <Text style={styles.iconBtnText}>×</Text>
                </Pressable>

                <View style={styles.budgetPill}>
                    <Text style={styles.budgetText}>Budget</Text>
                    <Text style={styles.budgetValue}>{budget.toFixed(0)}</Text>
                </View>
            </View>

            {/* bottom sheet */}
            <View style={styles.sheet}>
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
                        <Text style={styles.sheetCloseText}>×</Text>
                    </Pressable>
                </View>

                <View style={styles.categoryRow}>
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
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchRow}>
                    {swatches.map((sw) => (
                        <Pressable
                            key={sw.name}
                            style={[styles.swatch, activeItem === sw.name ? styles.swatchActive : null]}
                            onPress={() => {
                                setActiveItem(sw.name);
                                if (UI_DEMO_ONLY || !UnityView) {
                                    setBudget((b) => Math.max(0, b - sw.price));
                                    return;
                                }
                                unityRef.current?.postMessage('RNBridge', 'SetItem', sw.name);
                            }}
                        />
                    ))}
                </ScrollView>

                <View style={styles.actionsRow}>
                    <Pressable
                        style={styles.smallAction}
                        onPress={() => {
                            if (UI_DEMO_ONLY || !UnityView) {
                                setBudget((b) => b + 500);
                                return;
                            }
                            unityRef.current?.postMessage('RNBridge', 'Undo', '');
                        }}
                    >
                        <Text style={styles.smallActionText}>Undo</Text>
                    </Pressable>

                    <Pressable
                        style={styles.primaryAction}
                        onPress={() => {
                            // Placement is tap-to-place inside Unity. Primary button acts like “confirm / reselect”.
                            if (UI_DEMO_ONLY || !UnityView) return;
                            unityRef.current?.postMessage('RNBridge', 'Ping', 'PrimaryAction');
                        }}
                    >
                        <Text style={styles.primaryActionText}>●</Text>
                    </Pressable>

                    <Pressable
                        style={styles.smallAction}
                        onPress={() => {
                            if (UI_DEMO_ONLY || !UnityView) {
                                setBudget(45000);
                                return;
                            }
                            unityRef.current?.postMessage('RNBridge', 'Clear', '');
                        }}
                    >
                        <Text style={styles.smallActionText}>Clear</Text>
                    </Pressable>
                </View>
            </View>
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

    topHud: {
        position: 'absolute',
        left: 16,
        right: 16,
        top: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnText: {
        color: Colors.textMain,
        fontSize: 22,
        lineHeight: 22,
    },
    budgetPill: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
    },
    budgetText: {
        color: Colors.textMuted,
        fontSize: 13,
    },
    budgetValue: {
        color: Colors.textMain,
        fontSize: 15,
    },

    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 12,
        paddingBottom: 18,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(20,20,20,0.92)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetTitle: {
        color: Colors.textMain,
        fontSize: 13,
        letterSpacing: 1.2,
    },
    sheetClose: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetCloseText: {
        color: Colors.textMain,
        fontSize: 18,
        lineHeight: 18,
    },

    categoryRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.45)',
    },
    categoryChipText: {
        color: Colors.textMuted,
        fontSize: 12,
    },
    categoryChipTextActive: {
        color: Colors.textMain,
    },

    swatchRow: {
        paddingVertical: 14,
        gap: 10,
    },
    swatch: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    swatchActive: {
        borderColor: 'rgba(248, 213, 104, 0.95)',
    },

    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    smallAction: {
        width: 72,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallActionText: {
        color: Colors.textMain,
        fontSize: 12,
    },
    primaryAction: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(248, 213, 104, 0.92)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryActionText: {
        color: '#111',
        fontSize: 18,
        marginTop: -2,
    },
});
