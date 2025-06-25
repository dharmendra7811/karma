import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ActionScreen from './src/screens/ActionScreen';
import ImpactScreen from './src/screens/ImpactScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

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
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Good Deeds' }}
        />
        <Tab.Screen 
          name="Explore" 
          component={ExploreScreen}
          options={{ title: 'Explore' }}
        />
        <Tab.Screen 
          name="Action" 
          component={ActionScreen}
        />
        <Tab.Screen 
          name="Impact" 
          component={ImpactScreen}
          options={{ title: 'Community Impact' }}
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
