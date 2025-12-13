import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          // Sekme ikonları
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Zamanlayıcı') {
              iconName = 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = 'stats-chart-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },

          tabBarActiveTintColor: '#1e90ff',
          tabBarInactiveTintColor: '#888',

          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 60,
            paddingBottom: 6,
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen
          name="Zamanlayıcı"
          component={HomeScreen}
          options={{ tabBarLabel: 'Zamanlayıcı' }}
        />

        <Tab.Screen
          name="Raporlar"
          component={ReportsScreen}
          options={{ tabBarLabel: 'Raporlar' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
