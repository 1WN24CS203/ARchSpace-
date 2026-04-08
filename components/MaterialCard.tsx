import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Material } from '@/models/Material';
import { Colors } from '@/constants/colors';

interface MaterialCardProps {
    material: Material;
    onPress?: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onPress }) => {
    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Cover source={{ uri: material.image }} style={styles.cover} />
            <Card.Content style={styles.content}>
                <View style={styles.colorIndicatorContainer}>
                    <View style={[styles.colorIndicator, { backgroundColor: material.color }]} />
                    <Text variant="bodySmall" style={styles.categoryText}>{material.category.toUpperCase()}</Text>
                </View>
                <Text variant="bodyLarge" style={styles.title} numberOfLines={2}>
                    {material.name}
                </Text>
                <Text variant="bodyMedium" style={styles.price}>
                    ₹{material.pricePerUnit} <Text style={styles.unitText}>/ {material.unit}</Text>
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        borderRadius: 8,
    },
    cover: {
        height: 120,
        borderRadius: 0,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    content: {
        padding: 12,
    },
    colorIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryText: {
        color: Colors.textMuted,
        fontSize: 10,
        letterSpacing: 1,
    },
    title: {
        color: Colors.textMain,
        marginBottom: 8,
        minHeight: 40, // consistent height for 2 lines
    },
    price: {
        color: Colors.accentGoldHover,
        fontWeight: 'bold',
    },
    unitText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: 'normal',
    },
});
