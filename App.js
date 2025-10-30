import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Roam from 'roam-reactnative';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App = () => {
  const [locationData, setLocationData] = useState(null);

const requestIOSLocationAlwaysPermission = async () => {
  try {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'This permission check is for iOS devices.');
      return;
    }

    // Step 1: Request "When In Use" permission first
    const whenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

    if (whenInUse === RESULTS.GRANTED) {
      // Step 2: Request "Always" permission
      const always = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);

      if (always === RESULTS.GRANTED) {
        Alert.alert('✅ Permission Granted', 'Always allow location access is enabled.');
      } else if (always === RESULTS.BLOCKED) {
        Alert.alert(
          '⚠️ Permission Blocked',
          'Please enable “Always Allow” in iPhone Settings > Privacy > Location Services.'
        );
        openSettings();
      } else {
        Alert.alert(
          '⚠️ Permission Denied',
          '“Always Allow” permission not granted. Please update in Settings.'
        );
      }
    } else {
      Alert.alert(
        '⚠️ Permission Denied',
        'Please allow location access to use this feature.'
      );
    }
  } catch (error) {
    console.warn('Permission error:', error);
  }
};

  useEffect(() => {
    const listener = Roam.startListener('location', (location) => {
      console.log('📍 Location received:', location);
      setLocationData(location);
    });

    return () => Roam.stopListener('location');
  }, []);

  const startTracking = async () => {
    Roam.batchProcess(true, 0);
    Roam.startTracking();
    console.log('Tracking started');
  };

  const stopTracking = () => {
    Roam.stopTracking();
    console.log('Tracking stopped');
  };

  const locationItem = Array.isArray(locationData)
    ? locationData[0]
    : locationData || {};
  const location = locationItem.location || {};
  const otherDetails = { ...locationItem };
  delete otherDetails.location;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Request Permission Button */}
        <TouchableOpacity onPress={requestIOSLocationAlwaysPermission} style={styles.button}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>

        {/* Start / Stop Tracking Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={startTracking} style={styles.button}>
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopTracking} style={[styles.button, styles.stop]}>
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        </View>

        {/* Location + Device Info */}
        <View style={styles.dataBox}>
          <Text style={styles.title}>📍 Location Data</Text>

          {Object.keys(location).length > 0 ? (
            Object.entries(location).map(([key, value]) => (
              <Text key={key} style={styles.dataText}>
                {key}: {String(value)}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No location data available</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.title}>📡 Device Info</Text>

          {Object.keys(otherDetails).length > 0 ? (
            Object.entries(otherDetails).map(([key, value]) => (
              <Text key={key} style={styles.dataText}>
                {key}: {String(value)}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No device info available</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 10,
  },
  stop: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dataBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  dataText: {
    color: '#333',
    marginBottom: 4,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
  },
});
