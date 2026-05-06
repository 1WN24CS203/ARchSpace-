import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Text, Surface, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl, fetchWithTimeout } from '@/services/apiBaseUrl';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setUserProfile as setLocalUserProfile, getUserAvatar, setUserAvatar } from '@/services/userStore';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser } = useAuth();

    const [userName, setUserName] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Load stored display name + avatar
    useEffect(() => {
        if (user) {
            setUserName(user.displayName || '');
            getUserAvatar(user.email).then(uri => setAvatarUri(uri));
        }
    }, [user]);

    // ── Avatar picker ─────────────────────────────────────────────────────────
    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library to set a profile picture.',
            );
            return;
        }

        setAvatarLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],     // square crop
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]?.uri && user) {
                const uri = result.assets[0].uri;
                setAvatarUri(uri);
                await setUserAvatar(user.email, uri);
            }
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user) return;
        setAvatarUri(null);
        await setUserAvatar(user.email, null);
    };

    // ── Save profile ──────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!user?.email) return;
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, userName }),
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Failed to update profile.');
                return;
            }

            await setLocalUserProfile(user.email, { displayName: userName });
            await setUser({ ...user, displayName: userName });
            setSuccessMsg('Profile updated successfully!');
        } catch (err: any) {
            setErrorMsg(err?.message || 'Network error. Cannot connect to backend.');
        } finally {
            setLoading(false);
        }
    };

    // ── Delete account ────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!user?.email) return;

        Alert.alert(
            'Delete Account',
            'Are you sure? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/auth/profile`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: user.email }),
                            });
                            if (res.ok) {
                                await setUser(null);
                                router.replace('/');
                            } else {
                                const data = await res.json();
                                setErrorMsg(data.error || 'Failed to delete account.');
                            }
                        } catch {
                            setErrorMsg('Network error.');
                        }
                    },
                },
            ],
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

            {/* ── Avatar section ───────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.avatarWrapper}
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}
                >
                    {avatarLoading ? (
                        <View style={styles.avatarPlaceholder}>
                            <ActivityIndicator color={Colors.accentGold} />
                        </View>
                    ) : avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <MaterialCommunityIcons
                                name="account"
                                size={52}
                                color={Colors.accentGold}
                            />
                        </View>
                    )}

                    {/* Edit badge */}
                    <View style={styles.editBadge}>
                        <MaterialCommunityIcons name="camera" size={14} color="#1A1A1A" />
                    </View>
                </TouchableOpacity>

                <Text variant="titleMedium" style={styles.nameText}>
                    {user?.displayName || user?.email?.split('@')[0]}
                </Text>
                <Text style={styles.emailText}>{user?.email}</Text>

                {avatarUri && (
                    <TouchableOpacity onPress={handleRemoveAvatar} style={styles.removeAvatarBtn}>
                        <Text style={styles.removeAvatarText}>Remove photo</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Edit name ────────────────────────────────────────────────── */}
            <View style={styles.section}>
                <Surface style={styles.card} elevation={1}>
                    <Text style={styles.cardLabel}>DISPLAY NAME</Text>
                    <Text style={styles.infoText}>
                        Profile info can only be changed once every 2 weeks.
                    </Text>

                    <TextInput
                        label="Name"
                        value={userName}
                        onChangeText={setUserName}
                        style={styles.input}
                        textColor={Colors.textMain}
                        activeUnderlineColor={Colors.accentGold}
                        theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                        left={<TextInput.Icon icon="account-edit" color={Colors.textMuted} />}
                    />

                    {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                    {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

                    <CustomButton
                        title={loading ? 'Saving...' : 'Save Changes'}
                        onPress={loading ? undefined : handleSave}
                        variant="gold"
                        style={styles.saveBtn}
                    />
                </Surface>
            </View>

            {/* ── Danger zone ──────────────────────────────────────────────── */}
            <View style={styles.dangerZone}>
                <Text variant="titleMedium" style={styles.dangerTitle}>Danger Zone</Text>
                <Surface style={styles.dangerCard} elevation={1}>
                    <Text style={styles.dangerDesc}>
                        Once you delete your account, there is no going back. Please be certain.
                    </Text>
                    <CustomButton
                        title="Delete Account"
                        onPress={handleDelete}
                        variant="outline"
                    />
                </Surface>
            </View>
            </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const AVATAR_SIZE = 100;

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    scrollContent: {
        paddingBottom: 40,
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 36,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    avatarWrapper: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        marginBottom: 16,
        position: 'relative',
    },
    avatarImage: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 2,
        borderColor: Colors.accentGold,
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(212,175,55,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: Colors.accentGold,
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    nameText: {
        color: Colors.textMain,
        fontFamily: 'PlayfairDisplay-Regular',
        fontSize: 20,
        marginBottom: 4,
    },
    emailText: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 13,
        letterSpacing: 0.4,
    },
    removeAvatarBtn: {
        marginTop: 10,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    removeAvatarText: {
        color: '#FF6B6B',
        fontFamily: 'Lato-Regular',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    section: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    card: {
        backgroundColor: Colors.card,
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
    },
    cardLabel: {
        color: Colors.accentGold,
        fontFamily: 'Lato-Bold',
        fontSize: 11,
        letterSpacing: 2,
        marginBottom: 8,
    },
    infoText: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        marginBottom: 20,
        fontSize: 13,
    },
    input: {
        backgroundColor: Colors.primary,
        marginBottom: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    errorText: {
        color: '#FF4C4C',
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: 'Lato-Regular',
        fontSize: 13,
    },
    successText: {
        color: '#4CAF50',
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: 'Lato-Regular',
        fontSize: 13,
    },
    saveBtn: {
        marginTop: 4,
    },
    dangerZone: {
        padding: 24,
        paddingTop: 8,
    },
    dangerTitle: {
        color: '#FF4C4C',
        fontFamily: 'Lato-Bold',
        marginBottom: 12,
    },
    dangerCard: {
        backgroundColor: 'rgba(255, 76, 76, 0.05)',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 76, 76, 0.3)',
    },
    dangerDesc: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        marginBottom: 20,
        fontSize: 14,
    },
});
