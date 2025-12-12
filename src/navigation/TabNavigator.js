import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1e90ff',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: 6,
            height: 60,
          },
        }}
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
