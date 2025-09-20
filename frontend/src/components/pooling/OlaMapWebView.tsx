// src/components/pooling/OlaMapWebView.tsx
import React, { useMemo, forwardRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { OLA_MAPS_API_KEY } from '../../constants/config';

const TILESET_URL = 'https://api.olamaps.io/tiles/vector/v1/3dtiles/tileset.json';

interface OlaMapWebViewProps {
  onMapReady: () => void;
  onMapCenterChange: (coords: { lat: number; lng: number }) => void;
}

const OlaMapWebView = forwardRef<WebView, OlaMapWebViewProps>(({ onMapReady, onMapCenterChange }, ref) => {
  const html = useMemo(
    () => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, width=device-width, user-scalable=no" />
    <style> html,body,#map { height:100%; margin:0; padding:0; } </style>
    <script src="https://cdn.jsdelivr.net/npm/olamaps-web-sdk@1.1.4/dist/olamaps-web-sdk.umd.min.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (async function () {
        const sdk = new OlaMaps({ apiKey: '${OLA_MAPS_API_KEY}' });
        const map = await sdk.init({
          container: 'map', center: [72.8371, 19.1073], zoom: 15, pitch: 60, mode: '3d', tileset: '${TILESET_URL}'
        });

        let playerMarker = null;
        let destinationMarker = null;

        window.flyTo = (coords, zoom = 17) => {
          map.flyTo({ center: [coords.lng, coords.lat], zoom: zoom, duration: 1500 });
        };
        
        window.addOrUpdateDestinationMarker = async (coords) => {
          const position = [coords.lng, coords.lat];
          if (destinationMarker) {
            destinationMarker.setPosition(position);
          } else {
            destinationMarker = await sdk.addMarker({ position: position, draggable: false });
          }
        };

        window.clearDestinationMarker = () => {
          if (destinationMarker) {
            try { destinationMarker.remove(); } catch(e) { console.error("Could not remove marker:", e); }
            destinationMarker = null;
          }
        };

        window.setMapPitch = (pitch) => {
          map.easeTo({ pitch: pitch, duration: 750 });
        };

        window.drawRoute = (polyline) => {
          if (map.getLayer('route')) { map.removeLayer('route'); map.removeSource('route'); }
          map.addLayer({
            'id': 'route', 'type': 'line',
            'source': { 'type': 'geojson', 'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': polyline }}},
            'paint': { 'line-color': '#00AEEF', 'line-width': 8 }
          });
        };
        
        window.clearRoute = () => {
          if (map.getLayer('route')) { map.removeLayer('route'); map.removeSource('route'); }
        };

        map.on('moveend', () => {
          const center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapCenterChange', payload: { lng: center.lng, lat: center.lat }
          }));
        });
        
        window.updatePlayerView = (coords) => {
           const position = [coords.lng, coords.lat];
           if (!playerMarker) {
             playerMarker = sdk.addMarker ? sdk.addMarker({ position: position, draggable: false }) : null;
           } else {
             playerMarker.setPosition && playerMarker.setPosition(position);
           }
        };

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      })();
    </script>
  </body>
</html>`,
    []
  );

  // --- START OF CORRECTED BLOCK ---
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    
    const startWatchingLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 5 },
        (loc) => {
          // This 'const' was missing
          const { latitude: lat, longitude: lng } = loc.coords;
          const js = `window.updatePlayerView && window.updatePlayerView({ lng:${lng}, lat:${lat} }); true;`;
          
          if (ref && typeof ref !== 'function' && ref.current) {
            ref.current.injectJavaScript(js);
          }
        }
      );
    };

    startWatchingLocation();

    // The cleanup function MUST be returned directly by the effect
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [ref]);
  // --- END OF CORRECTED BLOCK ---

  return (
    <WebView
      ref={ref}
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'ready') {
            onMapReady();
          } else if (data.type === 'mapCenterChange') {
            onMapCenterChange(data.payload);
          }
        } catch (error) {
          console.error("Error parsing message from WebView:", error);
        }
      }}
    />
  );
});

export default OlaMapWebView;