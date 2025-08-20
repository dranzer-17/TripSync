    // src/app/(main)/services.tsx
    import React from 'react';
    import { Text } from 'react-native-paper';
    import ScreenWrapper from '../../components/ScreenWrapper';

    export default function ServicesScreen() {
      return (
        <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="headlineMedium">Services</Text>
        </ScreenWrapper>
      );
    }