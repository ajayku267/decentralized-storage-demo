import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({ title, showBack, onBackPress, rightComponent }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity 
              onPress={onBackPress} 
              style={[styles.backButton, { backgroundColor: theme.secondaryBackground }]}
            >
              <Icon name="arrow-left" size={24} color={theme.textColor} />
            </TouchableOpacity>
          )}
        </View>

        <Animated.Text 
          style={[
            styles.title, 
            { 
              color: theme.textColor,
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.bold,
            }
          ]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>

        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftSection: {
    width: 40,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
});

export default Header; 