import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

export default function SignupScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [workspaceKey, setWorkspaceKey] = useState('');
    const [loading, setLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    // ---------- CHANGE WORKSPACE KEY HERE ----------
    const VALID_WORKSPACE_KEY = 'BAVI-M2026';
    // -----------------------------------------------

    const handleSignup = () => {
        setErrorMsg('');
        setLoading(true);

        // Simulate signup network request
        setTimeout(() => {
            setLoading(false);

            if (workspaceKey.toUpperCase() !== VALID_WORKSPACE_KEY) {
                setErrorMsg('Invalid Workspace Invite Key. Please check with your admin.');
                return;
            }

            // Replace the entire navigation stack so the user can't go back to auth flow
            router.replace('/(tabs)');
        }, 1200);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text variant="displaySmall" style={styles.title}>Join ARchSpace</Text>
                        <Text variant="titleMedium" style={styles.subtitle}>Designer Registration</Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            style={styles.input}
                            textColor={Colors.textMain}
                            activeUnderlineColor={Colors.accentGold}
                            theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
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
                        />

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            textColor={Colors.textMain}
                            activeUnderlineColor={Colors.accentGold}
                            theme={{ colors: { onSurfaceVariant: Colors.textMuted } }}
                        />

                        <TextInput
                            label="Workspace Invite Key"
                            value={workspaceKey}
                            onChangeText={setWorkspaceKey}
                            autoCapitalize="characters"
                            placeholder="e.g. STUDIO-8B4K"
                            placeholderTextColor={Colors.borderSubtle}
                            style={[styles.input, styles.keyInput]}
                            textColor={Colors.accentGoldHover}
                            activeUnderlineColor={Colors.accentGoldHover}
                            theme={{ colors: { onSurfaceVariant: Colors.accentGold } }}
                        />

                        <View style={styles.buttonContainer}>
                            <CustomButton
                                title={loading ? "Creating Account..." : "Create Account"}
                                onPress={handleSignup}
                                variant="solid"
                                style={styles.signupButton}
                            />

                            <CustomButton
                                title="Back to Login"
                                onPress={() => router.back()}
                                variant="gold"
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
        padding: 32,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        color: Colors.accentGoldHover,
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
    form: {
        marginBottom: 24,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginBottom: 16,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    keyInput: {
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        marginBottom: 32,
    },
    buttonContainer: {
        marginTop: 8,
    },
    signupButton: {
        marginBottom: 16,
    },
    errorText: {
        color: '#FF4C4C', // A red error color that works on dark mode
        textAlign: 'center',
        marginTop: 16,
        fontFamily: 'Lato-Regular',
        fontSize: 13,
    }
});
