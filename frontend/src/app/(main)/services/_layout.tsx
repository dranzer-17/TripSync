import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false, // Hides "Back" text on iOS
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Community Services',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/services/dashboard' as any)}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="grid-outline" 
                  size={20} 
                  color="white"
                />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Service',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'My Services Dashboard',
        }}
      />
      <Stack.Screen 
        name="applicants/[id]" 
        options={{ 
          title: 'Applicants',
          headerBackVisible: true, // Force back button to show
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    marginRight: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
});