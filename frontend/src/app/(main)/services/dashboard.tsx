import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator, Card, Button, useTheme, Avatar, Badge } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useAuth } from '../../../context/AuthContext';
import { getMyServicePosts, getMyApplications, ServicePost, ServiceApplication } from '../../../services/servicesService';
import { Ionicons } from '@expo/vector-icons';

// A stylish card component for the "My Posts" tab
const MyPostCard = ({ post, index }: { post: ServicePost; index: number }) => {
    const theme = useTheme();
    const router = useRouter();
  // Animations removed: render statically for simpler UI and performance
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#28A745'; // Success green
            case 'in_progress': return theme.colors.primary;
            case 'completed': return '#F9A826'; // Accent gold
            case 'cancelled': return theme.colors.error;
            default: return theme.colors.onSurfaceVariant;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return 'check-circle-outline';
            case 'in_progress': return 'clock-outline';
            case 'completed': return 'checkmark-done-circle-outline';
            case 'cancelled': return 'close-circle-outline';
            default: return 'help-circle-outline';
        }
    };

  return (
    <View>
      <Card 
                style={{ 
                    marginBottom: 16, 
                    backgroundColor: theme.colors.surface,
                    elevation: 4,
                    borderRadius: 20,
                    borderLeftWidth: 6,
                    borderLeftColor: getStatusColor(post.status),
                    shadowColor: getStatusColor(post.status),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                }}
                mode="elevated"
            >
                <Card.Title
                    title={post.title}
                    titleVariant="titleMedium"
                    titleStyle={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 18 }}
                    subtitle={`Status: ${post.status} • Team Size: ${post.team_size} members`}
                    subtitleStyle={{ color: theme.colors.onSurfaceVariant, marginTop: 6, fontSize: 14 }}
                    left={(props) => (
                        <Avatar.Icon 
                            {...props} 
                            size={50}
                            icon={getStatusIcon(post.status)}
                            style={{ 
                                backgroundColor: getStatusColor(post.status) + '20',
                                borderWidth: 2,
                                borderColor: getStatusColor(post.status) + '40',
                            }}
                        />
                    )}
                    right={(props) => (
                        <Badge 
                            {...props} 
                            style={{ 
                                marginRight: 16, 
                                backgroundColor: getStatusColor(post.status),
                                color: '#FFFFFF',
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                            }}
                        >
                            {post.status.toUpperCase()}
                        </Badge>
                    )}
                />
                <Card.Content style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                    <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14, lineHeight: 20 }}>
                        {post.description?.substring(0, 100)}...
                    </Text>
                </Card.Content>
                <Card.Actions style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}>
                    <Button 
                        mode="contained"
                        icon="account-group-outline"
                        onPress={() => router.push(`/(main)/services/applicants/${post.id}` as any)}
                        style={{ 
                            borderRadius: 16,
                            backgroundColor: theme.colors.primary,
                            elevation: 2,
                            flex: 1,
                        }}
                        labelStyle={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}
                        contentStyle={{ paddingVertical: 8 }}
                    >
                        View Applicants
                    </Button>
                </Card.Actions>
      </Card>
    </View>
    );
};

// A stylish card component for the "My Applications" tab
const MyApplicationCard = ({ application, index }: { application: ServiceApplication; index: number }) => {
    const theme = useTheme();
    const router = useRouter();
  // Animations removed: render statically for simpler UI and performance
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return '#28A745'; // Success green
            case 'rejected': return theme.colors.error;
            case 'pending': return theme.colors.primary;
            default: return theme.colors.onSurfaceVariant;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return 'checkmark-circle';
            case 'rejected': return 'close-circle';
            case 'pending': return 'time';
            default: return 'help-circle';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

  return (
    <View>
      <Card 
                style={{ 
                    marginBottom: 16, 
                    backgroundColor: theme.colors.surface,
                    elevation: 4,
                    borderRadius: 20,
                    borderLeftWidth: 6,
                    borderLeftColor: getStatusColor(application.status),
                    shadowColor: getStatusColor(application.status),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                }} 
                onPress={() => router.push(`/(main)/services/${application.service_post.id}` as any)}
                mode="elevated"
            >
                <Card.Title
                    title={application.service_post.title}
                    titleVariant="titleMedium"
                    titleStyle={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 18 }}
                    subtitle={`Applied on ${formatDate(application.application_date)}`}
                    subtitleStyle={{ 
                        color: theme.colors.onSurfaceVariant, 
                        marginTop: 6,
                        fontSize: 14
                    }}
                    left={(props) => (
                        <Avatar.Icon 
                            {...props} 
                            size={50}
                            icon={getStatusIcon(application.status)}
                            style={{ 
                                backgroundColor: getStatusColor(application.status) + '20',
                                borderWidth: 2,
                                borderColor: getStatusColor(application.status) + '40',
                            }}
                        />
                    )}
                    right={(props) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                            <Badge 
                                style={{ 
                                    backgroundColor: getStatusColor(application.status),
                                    color: '#FFFFFF',
                                    borderRadius: 20,
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    marginRight: 8,
                                }}
                            >
                                {application.status.toUpperCase()}
                            </Badge>
                            <Ionicons 
                                name="chevron-forward" 
                                size={24} 
                                color={theme.colors.onSurfaceVariant} 
                            />
                        </View>
                    )}
                />
                {application.cover_letter && (
                    <Card.Content style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                        <Text style={{ 
                            color: theme.colors.onSurfaceVariant, 
                            fontSize: 14, 
                            lineHeight: 20,
                            fontStyle: 'italic' 
                        }}>
                            "{application.cover_letter.substring(0, 80)}..."
                        </Text>
                    </Card.Content>
                )}
      </Card>
    </View>
    );
};


export default function ServicesDashboard() {
  const theme = useTheme();
  const { token } = useAuth();
  const [tab, setTab] = useState<'my-posts' | 'my-applications'>('my-posts');
  const [myPosts, setMyPosts] = useState<ServicePost[]>([]);
  const [myApplications, setMyApplications] = useState<ServiceApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- THIS IS THE USEEFFECT FIX ---
  // The async logic is defined inside the useEffect callback, which is the correct pattern.
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!token) {
            Alert.alert("Authentication Error", "You must be logged in to view your dashboard.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
          if (tab === 'my-posts') {
            const posts = await getMyServicePosts(token);
            setMyPosts(posts);
          } else {
            const apps = await getMyApplications(token);
            setMyApplications(apps);
          }
        } catch (error: any) {
          Alert.alert('Error', `Failed to load data: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [token, tab]) // The effect re-runs when the token or the selected tab changes
  );

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.colors.background 
    },
    segmentContainer: { 
      padding: 20, 
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1, 
      borderBottomColor: theme.colors.outline,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    listContent: { 
      padding: 20,
      paddingBottom: 40,
    },
    center: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 40,
      backgroundColor: theme.colors.surface,
      margin: 20,
      borderRadius: 16,
      elevation: 1,
    },
    emptyIcon: { 
      marginBottom: 20,
      opacity: 0.6,
    },
    emptyText: { 
      color: theme.colors.onSurfaceVariant, 
      marginTop: 12, 
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 22,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
  });
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Loading your {tab === 'my-posts' ? 'posts' : 'applications'}...
          </Text>
        </View>
      );
    }

    if (tab === 'my-posts') {
      return (
        <FlatList
          data={myPosts}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => <MyPostCard post={item} index={index} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.onSurfaceVariant} style={styles.emptyIcon} />
                <Text variant="headlineSmall" style={{ fontWeight: '600', marginBottom: 8, color: theme.colors.onSurface }}>
                  No service posts yet
                </Text>
                <Text style={styles.emptyText}>
                  Ready to share your skills? Tap the '+' button on the main screen to create your first service post and start connecting with people who need your expertise.
                </Text>
            </View>
          }
        />
      );
    }

    if (tab === 'my-applications') {
      return (
        <FlatList
          data={myApplications}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => <MyApplicationCard application={item} index={index} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
                <Ionicons name="file-tray-outline" size={64} color={theme.colors.onSurfaceVariant} style={styles.emptyIcon} />
                <Text variant="headlineSmall" style={{ fontWeight: '600', marginBottom: 8, color: theme.colors.onSurface }}>
                  No applications yet
                </Text>
                <Text style={styles.emptyText}>
                  Start exploring available services and submit your applications. Your application history will appear here to help you track your progress.
                </Text>
            </View>
          }
        />
      );
    }
    return null;
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={(value) => setTab(value as any)}
          buttons={[
            { value: 'my-posts', label: 'My Posts', icon: 'post-outline' },
            { value: 'my-applications', label: 'My Applications', icon: 'file-check-outline' },
          ]}
          style={{ borderRadius: 12 }}
        />
      </View>
      {renderContent()}
    </ScreenWrapper>
  );
}