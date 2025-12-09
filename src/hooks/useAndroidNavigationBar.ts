import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export function useAndroidNavigationBar(hidden: boolean = true) {
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (hidden) {
        NavigationBar.setVisibilityAsync('hidden');
        NavigationBar.setBehaviorAsync('overlay-swipe');
      } else {
        NavigationBar.setVisibilityAsync('visible');
      }
    }

    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, [hidden]);
}
