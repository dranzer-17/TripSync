import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, ActivityIndicator, Button, useTheme, Avatar, Badge, Snackbar } from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { useAuth } from '../../../../context/AuthContext';
// --- IMPORT THE NEW UPDATE FUNCTION ---
import { getApplicationsForPost, ServiceApplication, updateApplicationStatus } from '../../../../services/servicesService';
import { Ionicons } from '@expo/vector-icons';

// A new, feature-rich component to render each applicant in the list
const ApplicantCard = ({ application, onStatusChange, isUpdating }: { 
    application: ServiceApplication, 
    onStatusChange: (appId: number, status: 'accepted' | 'rejected') => void,
    isUpdating: boolean 
}) => {
    const theme = useTheme();
    const { applicant, status, cover_letter } = application;

    const handleAccept = () => {
        onStatusChange(application.id, 'accepted');
    };

    const handleReject = () => {
        onStatusChange(application.id, 'rejected');
    };
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return '#4CAF50';
            case 'rejected': return theme.colors.error;
            default: return theme.colors.primary;
        }
    };

    return (
        <View style={{ 
            marginBottom: 16, 
            backgroundColor: theme.colors.surface, 
            borderRadius: 8,
            padding: 16,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Avatar.Icon size={40} icon="account-circle" />
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 12 }}>
                    {applicant.full_name}
                </Text>
            </View>
            {cover_letter && (
                <View style={{ marginBottom: 12 }}>
                    <Text variant="bodyMedium" style={{ fontStyle: 'italic', color: theme.colors.onSurfaceVariant }}>"{cover_letter}"</Text>
                </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                {status === 'pending' ? (
                    <View style={{ flexDirection: 'row' }}>
                        <Button onPress={handleReject} textColor={theme.colors.error} disabled={isUpdating}>Reject</Button>
                        <Button mode="contained" onPress={handleAccept} style={{ marginLeft: 8 }} disabled={isUpdating} loading={isUpdating}>Accept</Button>
                    </View>
                ) : (
                    <Badge style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: getStatusColor(status), color: '#FFF' }}>
                        {status.toUpperCase()}
                    </Badge>
                )}
            </View>
        </View>
    );
};


export default function ViewApplicantsScreen() {
    const theme = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    
    const [applications, setApplications] = useState<ServiceApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingApplicationId, setUpdatingApplicationId] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

    const fetchData = useCallback(async () => {
        if (!token || !id) return;
        setIsLoading(true);
        try {
            const postId = parseInt(id, 10);
            const fetchedApplications = await getApplicationsForPost(token, postId);
            setApplications(fetchedApplications);
        } catch (error: any) {
            setSnackbar({ visible: true, message: `Error: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    }, [token, id]);

    useFocusEffect(useCallback(() => {
        fetchData();
    }, [fetchData]));

    const handleStatusChange = async (applicationId: number, status: 'accepted' | 'rejected') => {
        if (!token || updatingApplicationId !== null) return;

        setUpdatingApplicationId(applicationId);
        try {
            await updateApplicationStatus(token, applicationId, status);
            
            // Update the local state to reflect the change
            setApplications(prevApps => 
                prevApps.map(app => 
                    app.id === applicationId 
                        ? { ...app, status } 
                        : app
                )
            );
            
            setSnackbar({ 
                visible: true, 
                message: `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!` 
            });
        } catch (error: any) {
            setSnackbar({ 
                visible: true, 
                message: `Failed to ${status} application: ${error.message}` 
            });
        } finally {
            setUpdatingApplicationId(null);
        }
    };
    
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        listContent: { padding: 16 },
        center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
        emptyIcon: { marginBottom: 16, opacity: 0.7 },
        emptyText: { color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' },
    });

    if (isLoading) {
        return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
    }

    return (
        <ScreenWrapper style={styles.container}>
            <FlatList
                data={applications}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ApplicantCard 
                        application={item} 
                        onStatusChange={handleStatusChange} 
                        isUpdating={updatingApplicationId === item.id}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Ionicons name="people-outline" size={64} color={theme.colors.onSurfaceVariant} style={styles.emptyIcon}/>
                        <Text variant="titleMedium">No Applicants Yet</Text>
                        <Text style={styles.emptyText}>When users apply to your service, they will appear here.</Text>
                    </View>
                }
            />
            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
                duration={3000}
            >
                {snackbar.message}
            </Snackbar>
        </ScreenWrapper>
    );
}