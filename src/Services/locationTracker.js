// locationTracker.js
import BackgroundGeolocation from 'react-native-background-geolocation'; // or expo-location + TaskManager

export function startLocationTracking(authToken) {
  BackgroundGeolocation.ready({
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 20,          // only fire on ~20m movement
    stopOnTerminate: false,      // keep running if app is killed
    startOnBoot: true,           // resume after phone restart
    url: '/api/v1/common/delivery-partner/update-location/',
    headers: { Authorization: `Bearer ${authToken}` },
    autoSync: true,              // auto-POSTs each location, retries on failure
  });

  BackgroundGeolocation.start();
}

export function stopLocationTracking() {
  BackgroundGeolocation.stop();
}