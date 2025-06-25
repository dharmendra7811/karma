import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

const ImpactScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📊 Community Impact</Text>
        <Text style={styles.subtitle}>Stats, leaderboards, and progress</Text>
        <Text style={styles.description}>
          Track community-wide progress, view leaderboards of top contributors,
          and see the collective impact of good deeds in your area.
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

export default ImpactScreen;
