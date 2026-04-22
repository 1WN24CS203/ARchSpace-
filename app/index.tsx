import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Animated } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
    const router = useRouter();
    const [authMode, setAuthMode] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = () => {
        if (!email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }
        setLoading(true);
        // Simulate sending OTP via Email (Gmail)
        setTimeout(() => {
            setLoading(false);
            setAuthMode('otp');
            // For Demo Purposes: Show a toast/alert or auto populate
            alert('Verification code sent to your email. (Use 1234 for demo)');
        }, 1500);
    };

    const handleVerifyOTP = () => {
        if (otp !== '1234') {
            alert('Invalid OTP. Please try 1234');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.replace('/(tabs)');
        }, 1000);
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        // Simulate Google OAuth Login
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
                        {authMode === 'email' ? (
                            <View style={styles.formMode}>
                                <Text style={styles.formTitle}>Sign In</Text>
                                <Text style={styles.formDescription}>Enter your email to receive a one-time passcode</Text>
                                
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
                            </View>
                        ) : (
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
                                    left={<TextInput.Icon icon="lock-outline" color={Colors.textMuted} />}
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

                    {authMode === 'email' && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Need an account? </Text>
                            <Text style={styles.signupText} onPress={() => router.push('/signup')}>Create one</Text>
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoIcon: {
        marginBottom: 16,
    },
    title: {
        color: Colors.textMain,
        fontFamily: 'PlayfairDisplay-Regular',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        letterSpacing: 3,
        textTransform: 'uppercase',
        fontSize: 11,
    },
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
    formMode: {
        // Wrapper for animated transitions if needed
    },
    formTitle: {
        color: Colors.textMain,
        fontFamily: 'PlayfairDisplay-Regular',
        fontSize: 24,
        marginBottom: 8,
    },
    formDescription: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    input: {
        backgroundColor: Colors.primary,
        marginBottom: 20,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        fontSize: 16,
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.borderSubtle,
    },
    dividerText: {
        color: Colors.textMuted,
        paddingHorizontal: 16,
        fontFamily: 'Lato-Regular',
        fontSize: 12,
        letterSpacing: 1,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: Colors.textMuted,
        fontSize: 14,
        fontFamily: 'Lato-Regular',
    },
    signupText: {
        color: Colors.accentGold,
        fontSize: 14,
        fontFamily: 'Lato-Bold',
    }
});
