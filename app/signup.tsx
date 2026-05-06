import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiBaseUrl, fetchWithTimeout } from '@/services/apiBaseUrl';
import { useAuth } from '@/context/AuthContext';
import { setUserProfile } from '@/services/userStore';

function validatePassword(passwordToCheck: string): string | null {
    const passwordTrimmed = passwordToCheck ?? '';
    if (passwordTrimmed.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-z]/.test(passwordTrimmed)) return 'Password must include at least 1 lowercase letter.';
    if (!/[A-Z]/.test(passwordTrimmed)) return 'Password must include at least 1 uppercase letter.';
    if (!/[0-9]/.test(passwordTrimmed)) return 'Password must include at least 1 number.';
    if (!/[^A-Za-z0-9]/.test(passwordTrimmed)) return 'Password must include at least 1 special character.';
    return null;
}

export default function SignupScreen() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [workspaceKey, setWorkspaceKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSignup = async () => {
        setErrorMsg('');
        
        if (!email || !password || !workspaceKey) {
            setErrorMsg('Email, Password, and Workspace Key are required.');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setErrorMsg(passwordError);
            return;
        }

        setLoading(true);

        try {
            const emailNormalized = String(email).trim().toLowerCase();
            const displayName = String(name).trim() || emailNormalized.split('@')[0] || null;

            const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailNormalized, password, companyCode: workspaceKey.toUpperCase(), userName: name })
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Failed to create account.');
                setLoading(false);
                return;
            }

            await setUserProfile(emailNormalized, { displayName: data.user?.userName || displayName });
            await setUser({ email: emailNormalized, displayName: data.user?.userName || displayName });
            setLoading(false);
            // Replace the entire navigation stack so the user can't go back to auth flow
            router.replace('/(tabs)/dashboard' as any);
        } catch {
            setLoading(false);
            setErrorMsg(`Cannot connect to the backend server (${getApiBaseUrl()}).`);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="cube-scan" size={48} color={Colors.accentGold} style={styles.logoIcon} />
                        <Text variant="displaySmall" style={styles.title}>Join ARchSpace</Text>
                        <Text variant="titleMedium" style={styles.subtitle}>Designer Registration</Text>
                    </View>

                    <View style={styles.formCard}>
                        <TextInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            style={styles.input}
                            textColor={Colors.textMain}
                            activeUnderlineColor={Colors.accentGold}
                            theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                            left={<TextInput.Icon icon="account" color={Colors.textMuted} />}
                        />

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
                            left={<TextInput.Icon icon="email" color={Colors.textMuted} />}
                        />

                        <TextInput
                            label="Set Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            textColor={Colors.textMain}
                            activeUnderlineColor={Colors.accentGold}
                            theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                            left={<TextInput.Icon icon="lock" color={Colors.textMuted} />}
                        />

                        <Text style={styles.passwordHint}>
                            Password: 8+ chars, upper + lower + number + symbol.
                        </Text>

                        <TextInput
                            label="Company Invite Code"
                            value={workspaceKey}
                            onChangeText={setWorkspaceKey}
                            autoCapitalize="characters"
                            placeholder="e.g. ARCH2026"
                            placeholderTextColor={Colors.borderSubtle}
                            style={[styles.input, styles.keyInput]}
                            textColor={Colors.accentGoldHover}
                            activeUnderlineColor={Colors.accentGoldHover}
                            theme={{ colors: { onSurfaceVariant: Colors.accentGold } }}
                            left={<TextInput.Icon icon="shield-key" color={Colors.accentGold} />}
                        />

                        <View style={styles.buttonContainer}>
                            <CustomButton
                                title={loading ? "Creating Account..." : "Create Account"}
                                onPress={loading ? undefined : handleSignup}
                                variant="solid"
                                style={styles.signupButton}
                            />

                            <CustomButton
                                title="Back to Login"
                                onPress={() => router.back()}
                                variant="outline"
                            />
                        </View>

                        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                    </View>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    logoIcon: {
        marginBottom: 16,
    },
    title: {
        color: Colors.textMain,
        fontFamily: 'PlayfairDisplay-Regular',
        marginBottom: 8,
    },
    subtitle: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontSize: 12,
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
    input: {
        backgroundColor: Colors.primary,
        marginBottom: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    passwordHint: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 16,
    },
    keyInput: {
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 8,
        gap: 16,
    },
    signupButton: {
        // Additional styling if needed
    },
    errorText: {
        color: '#FF4C4C',
        textAlign: 'center',
        marginTop: 16,
        fontFamily: 'Lato-Regular',
        fontSize: 13,
    }
});
