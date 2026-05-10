import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle, View, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

interface CustomButtonProps {
    title: string;
    onPress?: () => void | Promise<void>;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    variant?: 'gold' | 'solid' | 'outline';
    icon?: () => React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'gold',
    icon,
    loading = false,
    disabled = false
}) => {
    const isSolid = variant === 'solid';
    const isOutline = variant === 'outline';

    const handlePress = () => {
        if (loading || disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) {
            onPress();
        }
    };

    const renderIcon = () => {
        if (loading) return null;
        if (!icon) return null;
        return icon();
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSolid ? styles.solidButton : isOutline ? styles.outlineButton : styles.ghostButton,
                (disabled || loading) && styles.disabledButton,
                style
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={disabled || loading}
        >
            <View style={styles.internalContainer}>
                {loading ? (
                    <ActivityIndicator 
                        size="small" 
                        color={isSolid ? Colors.primary : Colors.accentGold} 
                        style={styles.loader} 
                    />
                ) : (
                    renderIcon()
                )}
                <Text
                    style={[
                        styles.text,
                        isSolid ? styles.solidText : isOutline ? styles.outlineText : styles.ghostText,
                        textStyle
                    ]}
                >
                    {loading ? 'Processing...' : title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8, // Increased for a more modern look
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52, // Consistent height
    },
    internalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.accentGold,
    },
    solidButton: {
        backgroundColor: Colors.accentGold,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.borderSubtle,
    },
    disabledButton: {
        opacity: 0.6,
    },
    loader: {
        marginRight: 10,
    },
    text: {
        fontFamily: 'Lato-Bold',
        fontSize: 14,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    ghostText: {
        color: Colors.accentGold,
    },
    solidText: {
        color: Colors.primary,
    },
    outlineText: {
        color: Colors.textMain,
    },
});
