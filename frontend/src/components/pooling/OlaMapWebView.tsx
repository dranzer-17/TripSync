// src/components/pooling/OlaMapWebView.tsx
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { OLA_MAPS_API_KEY } from '../../constants/config'; // Use a centralized config

// Replace with your Ola 3D tiles tileset.json (for your city/area)
const TILESET_URL = 'https://api.olamaps.io/tiles/vector/v1/3dtiles/tileset.json';

export default function OlaMapWebView() {
  const webRef = useRef<WebView>(null);

  // Follow the player (lat/lng/heading) and nudge camera toward them.
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          const { latitude: lat, longitude: lng, heading } = loc.coords;
          // Push updates into the WebView; the web page defines window.updatePlayerView(...)
          const js = `
            window.updatePlayerView && window.updatePlayerView({
              lng:${lng}, lat:${lat}, heading:${Number.isFinite(heading) ? heading : 0}
            });
            true; // note: this is required for iOS to prevent a warning
          `;
          webRef.current?.injectJavaScript(js);
        }
      );
    };

    startWatching();

    // Cleanup function to remove the subscription when the component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const html = useMemo(
    () => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, width=device-width, user-scalable=no" />
    <style>
      html,body,#map { height:100%; margin:0; padding:0; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/olamaps-web-sdk@1.1.4/dist/olamaps-web-sdk.umd.min.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (async function () {
        const sdk = new OlaMaps({ apiKey: '${OLA_MAPS_API_KEY}' });

        const map = await sdk.init({
          container: 'map',
          center: [72.8371, 19.1073],  // Default: [lng, lat] (Mumbai)
          zoom: 17,
          pitch: 60,
          bearing: 0,
          mode: '3d',
          tileset: '${TILESET_URL}'
        });

        sdk.enableMapRotation && sdk.enableMapRotation(true);
        sdk.enableMapCompass && sdk.enableMapCompass(true);

        let playerMarker = null;

        window.updatePlayerView = async ({ lng, lat, heading = 0 }) => {
          if (!playerMarker && sdk.addMarker) {
            // First time update, also move the camera instantly
            map?.flyTo({ center: [lng, lat], zoom: 17, pitch: 60, duration: 0 });
            playerMarker = await sdk.addMarker({ position: [lng, lat], draggable: false });
          } else if (playerMarker && playerMarker.setPosition) {
            playerMarker.setPosition([lng, lat]);
          }

          map?.easeTo({ center: [lng, lat], bearing: heading, duration: 1000 });
        };

        window.ReactNativeWebView?.postMessage(JSON.stringify({ ready: true }));
      })();
    </script>
  </body>
</html>`,
    []
  );

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccessFromFileURLs
      allowingReadAccessToURL={Platform.OS === 'ios' ? '/' : undefined}
    />
  );
}