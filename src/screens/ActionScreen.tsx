import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Category {
  id: string;
  label: string;
  emoji: string;
}

const ActionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deed' | 'activity'>('deed');
  const [deedDescription, setDeedDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Activity form state
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  const categories: Category[] = [
    { id: 'helping', label: 'Helping', emoji: '🤝' },
    { id: 'environment', label: 'Environment', emoji: '🌱' },
    { id: 'awareness', label: 'Awareness', emoji: '📢' },
    { id: 'education', label: 'Education', emoji: '📚' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'community', label: 'Community', emoji: '🏘️' },
  ];

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSubmitDeed = () => {
    if (!deedDescription.trim()) {
      Alert.alert('Missing Information', 'Please describe your good deed.');
      return;
    }

    Alert.alert(
      'Good Deed Shared! 🌟',
      'Thank you for making the world a better place!',
      [
        {
          text: 'Continue Spreading Kindness',
          onPress: () => {
            setDeedDescription('');
            setSelectedCategories([]);
            setIsAnonymous(false);
          },
        },
      ],
    );
  };

  const handleSubmitActivity = () => {
    if (!activityTitle.trim() || !activityDescription.trim()) {
      Alert.alert(
        'Missing Information',
        'Please fill in the title and description.',
      );
      return;
    }

    Alert.alert(
      'Community Activity Created! 🎉',
      'Your event has been posted for others to join!',
      [
        {
          text: 'Great!',
          onPress: () => {
            setActivityTitle('');
            setActivityDescription('');
            setActivityDate('');
            setActivityTime('');
            setActivityLocation('');
            setMaxParticipants('');
          },
        },
      ],
    );
  };

  const renderLogDeedTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>What good did you do today? ✨</Text>

      {/* Description Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your good deed..."
          placeholderTextColor="#9CA3AF"
          value={deedDescription}
          onChangeText={setDeedDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Category Tags */}
      <Text style={styles.sectionLabel}>Choose categories:</Text>
      <View style={styles.categoriesContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTag,
              selectedCategories.includes(category.id) &&
                styles.categoryTagSelected,
            ]}
            onPress={() => toggleCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategories.includes(category.id) &&
                  styles.categoryTextSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upload Image/Video */}
      <TouchableOpacity style={styles.uploadContainer}>
        <Icon name="add-photo-alternate" size={24} color="#059669" />
        <Text style={styles.uploadText}>Add photo or video</Text>
        <Icon name="keyboard-arrow-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Anonymous Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleLeft}>
          <Icon name="visibility-off" size={20} color="#059669" />
          <Text style={styles.toggleLabel}>Post anonymously</Text>
        </View>
        <Switch
          value={isAnonymous}
          onValueChange={setIsAnonymous}
          trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
          thumbColor={isAnonymous ? '#059669' : '#F3F4F6'}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitDeed}>
        <Text style={styles.submitButtonText}>Share Your Good Deed 🌱</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCreateActivityTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Plan a community event 🌍</Text>

      {/* Title Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What's your event called?"
          placeholderTextColor="#9CA3AF"
          value={activityTitle}
          onChangeText={setActivityTitle}
        />
      </View>

      {/* Description Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell people about your event..."
          placeholderTextColor="#9CA3AF"
          value={activityDescription}
          onChangeText={setActivityDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Date and Time */}
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Date</Text>
          <TouchableOpacity style={styles.dateTimeInput}>
            <Icon name="event" size={20} color="#059669" />
            <TextInput
              style={styles.dateTimeText}
              placeholder="Select date"
              placeholderTextColor="#9CA3AF"
              value={activityDate}
              onChangeText={setActivityDate}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Time</Text>
          <TouchableOpacity style={styles.dateTimeInput}>
            <Icon name="access-time" size={20} color="#059669" />
            <TextInput
              style={styles.dateTimeText}
              placeholder="Select time"
              placeholderTextColor="#9CA3AF"
              value={activityTime}
              onChangeText={setActivityTime}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location</Text>
        <TouchableOpacity style={styles.locationInput}>
          <Icon name="place" size={20} color="#059669" />
          <TextInput
            style={styles.locationText}
            placeholder="Where will this happen?"
            placeholderTextColor="#9CA3AF"
            value={activityLocation}
            onChangeText={setActivityLocation}
          />
          <Icon name="my-location" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Max Participants */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Max Participants (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="How many people can join?"
          placeholderTextColor="#9CA3AF"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="numeric"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitActivity}
      >
        <Text style={styles.submitButtonText}>Create Community Event 🎉</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'deed' && styles.activeTab]}
          onPress={() => setActiveTab('deed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'deed' && styles.activeTabText,
            ]}
          >
            Log a Deed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'activity' && styles.activeTabText,
            ]}
          >
            Create Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'deed' ? renderLogDeedTab() : renderCreateActivityTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#F0FDF4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'System',
  },
  activeTabText: {
    color: '#065F46',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'System',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'System',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'System',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
    fontFamily: 'System',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'System',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  categoryTextSelected: {
    color: '#065F46',
    fontWeight: '600',
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  uploadText: {
    flex: 1,
    fontSize: 16,
    color: '#059669',
    marginLeft: 12,
    fontFamily: 'System',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 32,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontFamily: 'System',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontFamily: 'System',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontFamily: 'System',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  quoteContainer: {
    backgroundColor: '#FEF3E0',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#92400E',
    fontFamily: 'System',
  },
});

export default ActionScreen;
