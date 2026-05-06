import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { getUserAvatar } from '@/services/userStore';

export default function LogoutScreen() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (user?.email) {
            getUserAvatar(user.email).then(uri => setAvatarUri(uri));
        }
    }, [user?.email]);

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        // Small press animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
        ]).start(async () => {
            await setUser(null);
            router.replace('/');
        });
    };

    return (
        <View style={styles.container}>
            {/* Decorative top glow */}
            <View style={styles.glowTop} />

            <View style={styles.content}>
                {/* Icon / Avatar */}
                <View style={styles.iconWrapper}>
                    {avatarUri ? (
                        <Image
                            source={{ uri: avatarUri }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name="logout-variant"
                            size={56}
                            color={Colors.accentGold}
                        />
                    )}
                </View>

                {/* Greeting */}
                <Text style={styles.greeting}>
                    {user?.displayName ? `Goodbye, ${user.displayName}` : 'Goodbye!'}
                </Text>
                <Text style={styles.email}>{user?.email}</Text>

                <View style={styles.divider} />

                <Text style={styles.message}>
                    You are about to sign out of ARchSpace.{'\n'}
                    Your projects and data will remain safe.
                </Text>

                {/* Logout button */}
                <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
                    <TouchableOpacity
                        style={[styles.logoutBtn, loading && styles.logoutBtnDisabled]}
                        onPress={handleLogout}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        <MaterialCommunityIcons
                            name={loading ? 'loading' : 'logout'}
                            size={20}
                            color="#1A1A1A"
                            style={styles.btnIcon}
                        />
                        <Text style={styles.logoutBtnText}>
                            {loading ? 'Signing out...' : 'Sign Out'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Cancel / stay */}
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.replace('/(tabs)/dashboard' as any)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelText}>Cancel — Stay Signed In</Text>
                </TouchableOpacity>
            </View>

            {/* Decorative bottom glow */}
            <View style={styles.glowBottom} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowTop: {
        position: 'absolute',
        top: -80,
        left: '20%',
        width: '60%',
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(212,175,55,0.07)',
        transform: [{ scaleX: 2 }],
    },
    glowBottom: {
        position: 'absolute',
        bottom: -80,
        left: '20%',
        width: '60%',
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(212,175,55,0.04)',
        transform: [{ scaleX: 2 }],
    },
    content: {
        width: '100%',
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    greeting: {
        color: Colors.textMain,
        fontFamily: 'PlayfairDisplay-Regular',
        fontSize: 26,
        textAlign: 'center',
        marginBottom: 6,
    },
    email: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    divider: {
        width: 48,
        height: 1,
        backgroundColor: Colors.borderSubtle,
        marginVertical: 24,
    },
    message: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.accentGold,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 16,
        shadowColor: Colors.accentGold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    logoutBtnDisabled: {
        opacity: 0.6,
    },
    btnIcon: {
        marginRight: 10,
    },
    logoutBtnText: {
        color: '#1A1A1A',
        fontFamily: 'Lato-Bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    cancelText: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: Colors.accentGold,
    },
});
