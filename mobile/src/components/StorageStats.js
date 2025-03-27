import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StorageStats = ({ totalStorage, usedStorage, filesCount }) => {
  const { theme } = useTheme();

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercentage = (usedStorage / totalStorage) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondaryBackground }]}>
          <Icon name="database" size={24} color={theme.primaryColor} />
        </View>
        <Text style={[styles.title, { color: theme.textColor }]}>Storage Overview</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.textColor }]}>
            {formatBytes(usedStorage)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Used</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.textColor }]}>
            {formatBytes(totalStorage)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Total</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.textColor }]}>
            {filesCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Files</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.secondaryBackground }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${usagePercentage}%`,
                backgroundColor: theme.primaryColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.secondaryTextColor }]}>
          {usagePercentage.toFixed(1)}% used
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default StorageStats; 