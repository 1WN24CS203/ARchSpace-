import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Animated } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiBaseUrl, fetchWithTimeout } from '@/services/apiBaseUrl';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/services/userStore';

export default function LoginScreen() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [authMode, setAuthMode] = useState<'password' | 'email' | 'otp'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Animated Popup State
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState<'error' | 'success'>('error');
    const popupAnim = React.useRef(new Animated.Value(-150)).current;

    const showPopup = (msg: string, type: 'error' | 'success' = 'error') => {
        setPopupMessage(msg);
        setPopupType(type);
        setPopupVisible(true);
        Animated.spring(popupAnim, {
            toValue: 60,
            useNativeDriver: true,
            bounciness: 12
        }).start();

        setTimeout(() => {
            Animated.timing(popupAnim, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setPopupVisible(false));
        }, 4000);
    };
    const handlePasswordLogin = async () => {
        if (!email || !password) {
            showPopup('Please enter both email and password.');
            return;
        }
        setLoading(true);

        try {
            const emailNormalized = String(email).trim().toLowerCase();
            const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailNormalized, password })
            });
            const data = await res.json();
            
            if (!res.ok) {
                showPopup(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            const profile = await getUserProfile(emailNormalized);
            await setUser({
                email: emailNormalized,
                displayName: profile?.displayName ?? data.user?.userName ?? emailNormalized.split('@')[0] ?? null,
            });
            
            setLoading(false);
            showPopup('Login successful!', 'success');
            setTimeout(() => router.replace('/(tabs)/dashboard' as any), 600);
        } catch (error) {
            setLoading(false);
            showPopup(`Cannot connect to the server (${getApiBaseUrl()}).`);
            console.error(error);
        }
    };

    const handleSendOTP = async () => {
        if (!email.includes('@')) {
            showPopup('Please enter a valid email address');
            return;
        }
        setLoading(true);

        try {
            const emailNormalized = String(email).trim().toLowerCase();
            const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailNormalized })
            });
            const data = await res.json();
            
            if (!res.ok) {
                showPopup(data.error || 'Failed to request OTP.');
                setLoading(false);
                return;
            }

            setLoading(false);
            setAuthMode('otp');
            
            if (data.demoModeCode) {
                showPopup(`[DEMO MODE]: Verification code generated: ${data.demoModeCode}`, 'success');
            } else {
                showPopup(data.message, 'success');
            }
        } catch (error) {
            setLoading(false);
            showPopup(`Cannot connect to the server (${getApiBaseUrl()}).`);
            console.error(error);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            showPopup('Please enter your OTP');
            return;
        }
        setLoading(true);
        try {
            const emailNormalized = String(email).trim().toLowerCase();
            const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailNormalized, otp })
            });
            const data = await res.json();

            if (!res.ok) {
                showPopup(data.error || 'Invalid OTP');
                setLoading(false);
                return;
            }

            const profile = await getUserProfile(emailNormalized);
            await setUser({
                email: emailNormalized,
                displayName: profile?.displayName ?? data.user?.userName ?? emailNormalized.split('@')[0] ?? null,
            });

            setLoading(false);
            showPopup('Verified securely!', 'success');
            setTimeout(() => router.replace('/(tabs)/dashboard' as any), 600);
        } catch (error) {
            setLoading(false);
            showPopup(`Cannot connect to the server (${getApiBaseUrl()}).`);
            console.error(error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {popupVisible && (
                <Animated.View style={[styles.popup, { transform: [{ translateY: popupAnim }], backgroundColor: popupType === 'error' ? '#FF4C4C' : '#4CAF50' }]}>
                    <Text style={styles.popupText}>{popupMessage}</Text>
                </Animated.View>
            )}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="cube-scan" size={48} color={Colors.accentGold} style={styles.logoIcon} />
                        <Text variant="displaySmall" style={styles.title}>ARchSpace</Text>
                        <Text variant="titleMedium" style={styles.subtitle}>Curate Your Reality</Text>
                    </View>

                    <View style={styles.formCard}>
                        {authMode === 'password' && (
                            <View style={styles.formMode}>
                                <Text style={styles.formTitle}>Login</Text>
                                <Text style={styles.formDescription}>Enter your credentials</Text>
                                
                                <TextInput
                                    label="Account Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                    textColor={Colors.textMain}
                                    activeUnderlineColor={Colors.accentGold}
                                    theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                    left={<TextInput.Icon icon="account-outline" color={Colors.textMuted} />}
                                />

                                <TextInput
                                    label="Database Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    style={styles.input}
                                    textColor={Colors.textMain}
                                    activeUnderlineColor={Colors.accentGold}
                                    theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                    left={<TextInput.Icon icon="lock-outline" color={Colors.textMuted} />}
                                />

                                <CustomButton
                                    title={loading ? "Authenticating..." : "System Login"}
                                    onPress={() => {
                                        if (loading) return;
                                        void handlePasswordLogin();
                                    }}
                                    variant="solid"
                                />

                                <View style={styles.resendContainer}>
                                    <Text style={styles.footerText}>Or access via </Text>
                                    <Text style={styles.signupText} onPress={() => setAuthMode('email')}>OTP Passcode</Text>
                                </View>
                            </View>
                        )}

                        {authMode === 'email' && (
                            <View style={styles.formMode}>
                                <Text style={styles.formTitle}>OTP Login</Text>
                                <Text style={styles.formDescription}>Enter your email to receive a temporary passcode</Text>
                                
                                <TextInput
                                    label="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                    textColor={Colors.textMain}
                                    activeUnderlineColor={Colors.accentGold}
                                    theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                    left={<TextInput.Icon icon="email-outline" color={Colors.textMuted} />}
                                />

                                <CustomButton
                                    title={loading ? "Sending..." : "Send Verification Code"}
                                    onPress={() => {
                                        if (loading) return;
                                        void handleSendOTP();
                                    }}
                                    variant="solid"
                                />


                                
                                <View style={styles.resendContainer}>
                                    <Text style={styles.footerText}>Prefer standard login? </Text>
                                    <Text style={styles.signupText} onPress={() => setAuthMode('password')}>Use Password</Text>
                                </View>
                            </View>
                        )}

                        {authMode === 'otp' && (
                            <View style={styles.formMode}>
                                <Text style={styles.formTitle}>Verify Email</Text>
                                <Text style={styles.formDescription}>Enter the 4-digit code sent to {email}</Text>
                                
                                <TextInput
                                    label="Verification Code"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    secureTextEntry
                                    style={[styles.input, styles.otpInput]}
                                    textColor={Colors.textMain}
                                    activeUnderlineColor={Colors.accentGold}
                                    theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                                    left={<TextInput.Icon icon="shield-check-outline" color={Colors.textMuted} />}
                                />

                                <CustomButton
                                    title={loading ? "Verifying..." : "Secure Login"}
                                    onPress={() => {
                                        if (loading) return;
                                        void handleVerifyOTP();
                                    }}
                                    variant="solid"
                                />

                                <View style={styles.resendContainer}>
                                    <Text style={styles.footerText}>Didn&apos;t receive code? </Text>
                                    <Text style={styles.signupText} onPress={() => setAuthMode('email')}>Change Email</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Need an account? </Text>
                        <Text style={styles.signupText} onPress={() => router.push('/signup')}>Register with Company Code</Text>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        padding: 16,
        paddingVertical: 18,
        borderRadius: 8,
        zIndex: 100,
        elevation: 100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    popupText: {
        color: '#FFF',
        fontFamily: 'Lato-Bold',
        fontSize: 14,
        textAlign: 'center',
    },
    container: { flex: 1, backgroundColor: Colors.primary },
    content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { marginBottom: 40, alignItems: 'center' },
    logoIcon: { marginBottom: 16 },
    title: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', marginBottom: 8, letterSpacing: 1 },
    subtitle: { color: Colors.textMuted, fontFamily: 'Lato-Regular', letterSpacing: 3, textTransform: 'uppercase', fontSize: 11 },
    formCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    formMode: {},
    formTitle: { color: Colors.textMain, fontFamily: 'PlayfairDisplay-Regular', fontSize: 24, marginBottom: 8 },
    formDescription: { color: Colors.textMuted, fontFamily: 'Lato-Regular', fontSize: 14, marginBottom: 24, lineHeight: 20 },
    input: {
        backgroundColor: Colors.primary,
        marginBottom: 20,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        fontSize: 16,
    },
    otpInput: { textAlign: 'left', letterSpacing: 8 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderSubtle },
    dividerText: { color: Colors.textMuted, paddingHorizontal: 16, fontFamily: 'Lato-Regular', fontSize: 12, letterSpacing: 1 },
    resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    footerText: { color: Colors.textMuted, fontSize: 14, fontFamily: 'Lato-Regular' },
    signupText: { color: Colors.accentGold, fontSize: 14, fontFamily: 'Lato-Bold' }
});
