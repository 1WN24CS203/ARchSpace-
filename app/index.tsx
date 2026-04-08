import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        // Simulate login network request
        setTimeout(() => {
            setLoading(false);
            // Replace the entire navigation stack so the user can't go back to login
            router.replace('/(tabs)');
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text variant="displaySmall" style={styles.title}>ARchSpace</Text>
                        <Text variant="titleMedium" style={styles.subtitle}>Designer Workspace Portal</Text>
                    </View>

                    <View style={styles.form}>
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

                        <View style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>Recover Password?</Text>
                        </View>

                        <CustomButton
                            title={loading ? "Authenticating..." : "Enter Workspace"}
                            onPress={handleLogin}
                            variant="solid"
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Need access? </Text>
                        <Text style={styles.signupText} onPress={() => router.push('/signup')}>Register with a Workspace Key</Text>
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
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 32,
    },
    header: {
        marginBottom: 48,
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        color: Colors.textMuted,
        fontFamily: 'Lato-Regular',
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: Colors.borderAccent,
        fontSize: 13,
    },
    signupText: {
        color: Colors.accentGold,
        fontSize: 13,
        fontFamily: 'Lato-Bold',
        marginLeft: 4,
    }
});
