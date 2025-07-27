import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ImpactProvider } from './src/contexts/ImpactContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { NavigationProvider } from './src/contexts/NavigationContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import HomeScreen from './src/screens/HomeScreen';
import ActionScreen from './src/screens/ActionScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ImpactScreen from './src/screens/ImpactScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#10B981" />
    <Text style={styles.loadingText}>Loading Karma...</Text>
  </View>
);

interface TabItem {
  key: string;
  title: string;
  icon: string;
  component: React.ComponentType;
}

const tabs: TabItem[] = [
  { key: 'home', title: 'Home', icon: 'home', component: HomeScreen },
  {
    key: 'explore',
    title: 'Explore',
    icon: 'explore',
    component: ExploreScreen,
  },
  {
    key: 'action',
    title: 'Action',
    icon: 'add-circle',
    component: ActionScreen,
  },
  {
    key: 'impact',
    title: 'Impact',
    icon: 'trending-up',
    component: ImpactScreen,
  },
  {
    key: 'profile',
    title: 'Profile',
    icon: 'person',
    component: ProfileScreen,
  },
];

const SimpleTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const ActiveComponent =
    tabs.find(tab => tab.key === activeTab)?.component || HomeScreen;

  return (
    <View style={styles.container}>
      {/* Content Area */}
      <View style={styles.content}>
        <NavigationProvider navigate={setActiveTab} currentTab={activeTab}>
          <ActiveComponent />
        </NavigationProvider>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={activeTab === tab.key ? '#059669' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? '#059669' : '#9CA3AF' },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <SimpleTabNavigator /> : <AuthNavigator />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ImpactProvider>
          <AppContent />
        </ImpactProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#065F46',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default App;
