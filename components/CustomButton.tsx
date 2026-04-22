import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    variant?: 'gold' | 'solid' | 'outline';
    icon?: () => React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'gold',
    icon
}) => {
    const isSolid = variant === 'solid';
    const isOutline = variant === 'outline';

    const renderIcon = () => {
        if (!icon) return null;
        return icon();
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSolid ? styles.solidButton : isOutline ? styles.outlineButton : styles.ghostButton,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.internalContainer}>
                {renderIcon()}
                <Text
                    style={[
                        styles.text,
                        isSolid ? styles.solidText : isOutline ? styles.outlineText : styles.ghostText,
                        textStyle
                    ]}
                >
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    internalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.accentGold,
    },
    solidButton: {
        backgroundColor: Colors.accentGold,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        borderRadius: 8,
    },
    text: {
        fontFamily: 'Lato-Bold',
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    ghostText: {
        color: Colors.accentGold,
    },
    solidText: {
        color: Colors.primary, // Black text on gold background
    },
    outlineText: {
        color: Colors.textMain,
    },
});
