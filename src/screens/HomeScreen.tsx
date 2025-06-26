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
import { GoodDeed } from '../types';
import FloatingActionButton from '../components/FloatingActionButton';

const HomeScreen: React.FC = () => {
  const goodDeeds: GoodDeed[] = [
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: '🌸',
      image: '🌳',
      description:
        'Planted 5 trees in the local park with my neighborhood group today!',
      likes: 24,
      comments: 8,
      timeAgo: '2 hours ago',
    },
    {
      id: 2,
      user: 'Marcus Johnson',
      avatar: '🌟',
      image: '🍲',
      description:
        'Cooked meals for the homeless shelter downtown. Nothing beats seeing smiles!',
      likes: 31,
      comments: 12,
      timeAgo: '4 hours ago',
    },
    {
      id: 3,
      user: 'Elena Rodriguez',
      avatar: '🌻',
      image: '📚',
      description:
        "Donated 20 books to the local library's children's section.",
      likes: 18,
      comments: 5,
      timeAgo: '6 hours ago',
    },
    {
      id: 4,
      user: 'David Kim',
      avatar: '🌱',
      image: '🐕',
      description:
        'Volunteered at the animal rescue center - these pups made my day!',
      likes: 42,
      comments: 15,
      timeAgo: '8 hours ago',
    },
    {
      id: 5,
      user: 'Maya Patel',
      avatar: '🌈',
      image: '👵',
      description:
        'Spent the afternoon reading to elderly residents at the care home.',
      likes: 27,
      comments: 9,
      timeAgo: '10 hours ago',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Motivational Header */}
      <View style={styles.header}>
        <Text style={styles.motivationalText}>
          Every good deed grows the world 🌱
        </Text>
        <Text style={styles.subText}>Together, we're making a difference</Text>
      </View>

      {/* Good Deeds Feed */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {goodDeeds.map(deed => (
          <View key={deed.id} style={styles.deedCard}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{deed.avatar}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{deed.user}</Text>
                <Text style={styles.timeAgo}>{deed.timeAgo}</Text>
              </View>
            </View>

            {/* Deed Image */}
            <View style={styles.deedImageContainer}>
              <Text style={styles.deedImage}>{deed.image}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{deed.description}</Text>

            {/* Action Buttons */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="favorite-border" size={18} color="#059669" />
                <Text style={styles.actionText}>{deed.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="chat-bubble-outline" size={18} color="#059669" />
                <Text style={styles.actionText}>{deed.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="share" size={18} color="#059669" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 3,
    borderBottomColor: '#FEF3E0',
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subText: {
    fontSize: 14,
    color: '#059669',
    opacity: 0.8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  deedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0FDF4',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#FEF3E0',
  },
  avatar: {
    fontSize: 18,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: 'System',
  },
  timeAgo: {
    fontSize: 12,
    color: '#059669',
    opacity: 0.7,
    marginTop: 2,
    fontFamily: 'System',
  },
  deedImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#FEF3E0',
  },
  deedImage: {
    fontSize: 32,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'System',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0FDF4',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
    marginLeft: 4,
    fontFamily: 'System',
  },
});

export default HomeScreen;
