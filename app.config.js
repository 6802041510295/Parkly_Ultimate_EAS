const GOOGLE_MAPS_API_KEY = 'AIzaSyBAOZhiZw6yTVQTlbxBLxfV1mzZaqelAXg';

module.exports = {
  expo: {
    name: 'Parkly Smart Parking',
    slug: 'parkly-smart-parking',
    version: '2.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'parkly',

    icon: './assets/icon.png',

    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#F8E9D0'
    },

    android: {
      package: 'com.parkly.smartparking',
      versionCode: 2,

      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F8E9D0'
      },

      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION'
      ]
    },

    extra: {
      eas: {
        projectId: '1307ba46-8e6d-47a5-ab03-170600a783b4'
      }
    },

    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png'
    },

    plugins: [
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Allow Parkly to use your location to find nearby parking.',
          locationAlwaysAndWhenInUsePermission:
            'Allow Parkly to use your location to find nearby parking.'
        }
      ],

      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY
        }
      ]
    ]
  }
};