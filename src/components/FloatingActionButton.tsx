import React from 'react';
import { TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FloatingActionButtonProps {
  onPress?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert(
        'Share Your Good Deed! 🌟',
        "Tell the world about the positive impact you're making!",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share Deed',
            onPress: () => console.log('Navigate to share screen'),
          },
        ],
      );
    }
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress}>
      <View style={styles.fabInner}>
        <Icon name="add" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34D399',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34D399',
  },
});

export default FloatingActionButton;
