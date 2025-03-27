import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const StorageProviders = ({ providers, onProviderPress }) => {
  const { theme } = useTheme();

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderProviderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.providerItemContainer,
        {
          transform: [
            {
              translateY: new Animated.Value(0).interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: new Animated.Value(0).interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.providerItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => onProviderPress(item)}
      >
        <View style={styles.providerHeader}>
          <View style={[styles.providerIcon, { backgroundColor: theme.secondaryBackground }]}>
            <Icon name="server" size={24} color={theme.primaryColor} />
          </View>
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: theme.textColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.providerAddress, { color: theme.secondaryTextColor }]}>
              {item.address.slice(0, 6)}...{item.address.slice(-4)}
            </Text>
          </View>
        </View>

        <View style={styles.providerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textColor }]}>
              {formatBytes(item.totalSpace)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Total Space</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textColor }]}>
              {item.reputationScore}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Reputation</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.textColor }]}>
              {item.stakedAmount} STOR
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Staked</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.secondaryBackground }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${(item.usedSpace / item.totalSpace) * 100}%`,
                  backgroundColor: theme.primaryColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.secondaryTextColor }]}>
            {((item.usedSpace / item.totalSpace) * 100).toFixed(1)}% used
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondaryBackground }]}>
          <Icon name="server-network" size={24} color={theme.primaryColor} />
        </View>
        <Text style={[styles.title, { color: theme.textColor }]}>Storage Providers</Text>
      </View>

      <FlatList
        data={providers}
        renderItem={renderProviderItem}
        keyExtractor={(item) => item.address}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="server-off" size={48} color={theme.secondaryTextColor} />
            <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
              No storage providers available
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  listContent: {
    paddingBottom: 20,
  },
  providerItemContainer: {
    marginBottom: 16,
  },
  providerItem: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerAddress: {
    fontSize: 14,
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default StorageProviders; 