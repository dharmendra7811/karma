import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Deed, HelpRequest } from '../types';

const HomeScreen: React.FC = () => {
  const mockDeeds: Deed[] = [
    {
      id: 1,
      user: 'Sarah M.',
      action: 'Helped elderly neighbor with groceries',
      location: '2 blocks away',
      karma: 15,
      time: '2h ago',
    },
    {
      id: 2,
      user: 'Mike R.',
      action: 'Donated books to local library',
      location: 'Downtown Library',
      karma: 10,
      time: '4h ago',
    },
    {
      id: 3,
      user: 'Emma L.',
      action: 'Organized community cleanup',
      location: 'Central Park',
      karma: 25,
      time: '1d ago',
    },
  ];

  const nearbyRequests: HelpRequest[] = [
    {
      id: 1,
      request: 'Need help moving furniture',
      user: 'John D.',
      distance: '0.5 miles',
      karma: 20,
    },
    {
      id: 2,
      request: 'Looking for tutoring help',
      user: 'Lisa K.',
      distance: '1.2 miles',
      karma: 15,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back! 👋</Text>
          <Text style={styles.karmaText}>
            Your karma score: <Text style={styles.karmaValue}>142</Text>
          </Text>
        </View>

        {/* Nearby Help Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Requests Near You</Text>
          {nearbyRequests.map(request => (
            <TouchableOpacity key={request.id} style={styles.requestCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.requestTitle}>{request.request}</Text>
                  <Text style={styles.requestMeta}>
                    by {request.user} • {request.distance}
                  </Text>
                </View>
                <View style={styles.karmaSection}>
                  <Icon name="star" size={16} color="#F59E0B" />
                  <Text style={styles.karmaPoints}>{request.karma}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Good Deeds Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Good Deeds</Text>
          {mockDeeds.map(deed => (
            <View key={deed.id} style={styles.deedCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.userName}>{deed.user}</Text>
                  <Text style={styles.deedAction}>{deed.action}</Text>
                  <Text style={styles.deedMeta}>
                    {deed.location} • {deed.time}
                  </Text>
                </View>
                <View style={styles.karmaSection}>
                  <Icon name="favorite" size={16} color="#EF4444" />
                  <Text style={styles.karmaEarned}>+{deed.karma}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="thumb-up" size={16} color="#6B7280" />
                  <Text style={styles.actionText}>Appreciate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="share" size={16} color="#6B7280" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  karmaText: {
    fontSize: 16,
    color: '#6b7280',
  },
  karmaValue: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FB923C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deedCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  requestMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  deedAction: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  deedMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  karmaSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  karmaPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  karmaEarned: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
});

export default HomeScreen;
