import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Animated } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

// Resolve to Windows computer's WiFi IP so physical devices on Expo Go can connect!
const getApiBaseUrl = () => {
    return 'http://10.161.246.19:3000'; 
};

export default function LoginScreen() {
    const router = useRouter();
    const [authMode, setAuthMode] = useState<'password' | 'email' | 'otp'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (!res.ok) {
                alert(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }
            
            setLoading(false);
            router.replace('/(tabs)');
        } catch (error) {
            setLoading(false);
            alert('Cannot connect to the server database. Ensure the backend is running.');
            console.error(error);
        }
    };

    const handleSendOTP = async () => {
        if (!email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`${getApiBaseUrl()}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (!res.ok) {
                alert(data.error || 'Failed to request OTP.');
                setLoading(false);
                return;
            }

            setLoading(false);
            setAuthMode('otp');
            
            if (data.demoModeCode) {
                alert(`[DEMO MODE]: Verification code generated: ${data.demoModeCode}`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            setLoading(false);
            alert('Cannot connect to the server database. Ensure the backend is running.');
            console.error(error);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            alert('Please enter your OTP');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${getApiBaseUrl()}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Invalid OTP');
                setLoading(false);
                return;
            }

            setLoading(false);
            router.replace('/(tabs)');
        } catch (error) {
            setLoading(false);
            alert('Cannot connect to the server database. Ensure the backend is running.');
            console.error(error);
        }
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.replace('/(tabs)');
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="cube-scan" size={48} color={Colors.accentGold} style={styles.logoIcon} />
                        <Text variant="displaySmall" style={styles.title}>ARchSpace</Text>
                        <Text variant="titleMedium" style={styles.subtitle}>Curate Your Reality</Text>
                    </View>

                    <View style={styles.formCard}>
                        {authMode === 'password' && (
                            <View style={styles.formMode}>
                                <Text style={styles.formTitle}>Secure Portal</Text>
                                <Text style={styles.formDescription}>Enter your credentials mapped to MongoDB</Text>
                                
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
                                    onPress={handlePasswordLogin}
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
                                    onPress={handleSendOTP}
                                    variant="solid"
                                />

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <CustomButton
                                    title="Continue with Google"
                                    onPress={handleGoogleLogin}
                                    variant="outline"
                                    icon={() => <AntDesign name="google" size={20} color={Colors.textMain} style={{marginRight: 8}} />}
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
                                    onPress={handleVerifyOTP}
                                    variant="solid"
                                />

                                <View style={styles.resendContainer}>
                                    <Text style={styles.footerText}>Didn't receive code? </Text>
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
    otpInput: { textAlign: 'center', letterSpacing: 8 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderSubtle },
    dividerText: { color: Colors.textMuted, paddingHorizontal: 16, fontFamily: 'Lato-Regular', fontSize: 12, letterSpacing: 1 },
    resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    footerText: { color: Colors.textMuted, fontSize: 14, fontFamily: 'Lato-Regular' },
    signupText: { color: Colors.accentGold, fontSize: 14, fontFamily: 'Lato-Bold' }
});
