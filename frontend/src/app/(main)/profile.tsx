    import React from 'react';
    import { Text } from 'react-native-paper';
    import ScreenWrapper from '../../components/ScreenWrapper';

    export default function ProfileScreen() {
      return (
        <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="headlineMedium">Profile</Text>
        </ScreenWrapper>
      );
    }