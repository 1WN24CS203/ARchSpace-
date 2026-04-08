import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Project } from '@/models/Project';
import { Colors } from '@/constants/colors';

interface ProjectCardProps {
    project: Project;
    onPress?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
    const theme = useTheme();

    return (
        <Card style={styles.card} onPress={onPress}>
            {project.image && <Card.Cover source={{ uri: project.image }} style={styles.cover} />}
            <Card.Content style={styles.content}>
                <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                        {project.name}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{project.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                </View>
                <Text variant="bodyMedium" style={styles.clientText}>Client: {project.clientName}</Text>
                <View style={styles.detailsRow}>
                    <Text variant="bodySmall" style={styles.detailText}>{project.rooms} Rooms</Text>
                    <Text variant="bodySmall" style={styles.budget}>₹{project.estimatedBudget.toLocaleString()}</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.borderSubtle,
        borderRadius: 8,
        overflow: 'hidden',
    },
    cover: {
        height: 140,
        borderRadius: 0,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: Colors.textMain,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    statusText: {
        color: Colors.accentGold,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    clientText: {
        color: Colors.textMuted,
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailText: {
        color: Colors.textMuted,
    },
    budget: {
        color: Colors.accentGoldHover,
        fontWeight: 'bold',
    },
});
