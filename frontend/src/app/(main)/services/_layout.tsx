import { Stack, useRouter } from 'expo-router';
import { useTheme, IconButton } from 'react-native-paper';

export default function ServicesLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface }, // Use theme surface (white)
        headerTintColor: theme.colors.onSurface, // Use theme onSurface (dark)
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Community Services',
          headerRight: () => (
            <IconButton
              icon="view-dashboard-outline"
              iconColor={theme.colors.onSurface} // Use theme onSurface color
              onPress={() => router.push('/services/dashboard' as any)}
            />
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
        options={{ title: 'Applicants' }} 
      />
    </Stack>

  );
}