import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './src/screens/HomeScreen';
import ActionScreen from './src/screens/ActionScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ImpactScreen from './src/screens/ImpactScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: string;

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Explore':
                iconName = 'explore';
                break;
              case 'Action':
                iconName = 'add-circle';
                break;
              case 'Impact':
                iconName = 'trending-up';
                break;
              case 'Profile':
                iconName = 'person';
                break;
              default:
                iconName = 'circle';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#059669',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#F0FDF4',
          },
          headerStyle: {
            backgroundColor: '#F0FDF4',
          },
          headerTintColor: '#065F46',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Karma',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ title: 'Explore' }}
        />
        <Tab.Screen
          name="Action"
          component={ActionScreen}
          options={{ title: 'Take Action' }}
        />
        <Tab.Screen
          name="Impact"
          component={ImpactScreen}
          options={{ title: 'Karma Impact' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'My Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
