import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

const ExploreScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔍 Explore Screen</Text>
        <Text style={styles.subtitle}>Search users, deeds, and tags</Text>
        <Text style={styles.description}>
          This screen will allow users to discover new community members,
          browse good deeds by category, and explore trending hashtags.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExploreScreen;
