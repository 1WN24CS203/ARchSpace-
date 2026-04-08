import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    variant?: 'gold' | 'solid';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'gold'
}) => {
    const isSolid = variant === 'solid';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSolid ? styles.solidButton : styles.ghostButton,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text
                style={[
                    styles.text,
                    isSolid ? styles.solidText : styles.ghostText,
                    textStyle
                ]}
            >
                {title}
            </Text>
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
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.accentGold,
    },
    solidButton: {
        backgroundColor: Colors.accentGold,
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
});
