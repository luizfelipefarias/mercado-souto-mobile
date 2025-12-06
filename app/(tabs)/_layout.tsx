import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { theme } from '../../constants/theme';

type TabItem = {
  name: string;
  title?: string;
  icon: string;
  iconFocused?: string;
  hidden?: boolean;
};

const TABS: TabItem[] = [
  { name: 'home', title: 'Início', icon: 'home-outline', iconFocused: 'home' },
  { name: 'favorites', title: 'Favoritos', icon: 'heart-outline', iconFocused: 'heart' },
  { name: 'my-purchases', title: 'Compras', icon: 'shopping-outline', iconFocused: 'shopping' },
  { name: 'notifications', title: 'Notificações', icon: 'bell-outline', iconFocused: 'bell' },
  { name: 'menu', title: 'Mais', icon: 'menu' },
  { name: 'categories', hidden: true, icon: 'shape' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#666666',

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          elevation: 0,

          height: Platform.OS === 'android' ? 70 : 95,
          paddingBottom: Platform.OS === 'android' ? 12 : 30,
          paddingTop: 10,
        },

        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            href: tab.hidden ? null : undefined,
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={
                  focused && tab.iconFocused
                    ? (tab.iconFocused as any)
                    : (tab.icon as any)
                }
                size={30}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
