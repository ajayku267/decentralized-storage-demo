import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import StorageStats from '../components/StorageStats';
import RecentFiles from '../components/RecentFiles';
import StorageProviders from '../components/StorageProviders';
import { fetchUserStats, fetchRecentFiles } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { account, isConnected } = useWeb3();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      if (isConnected && account) {
        const [userStats, files] = await Promise.all([
          fetchUserStats(account),
          fetchRecentFiles(account),
        ]);
        setStats(userStats);
        setRecentFiles(files);
      }
    } catch (error) {
      console.error('Error loading home screen data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [isConnected, account]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.message, { color: theme.textColor }]}>
          Please connect your wallet to view your storage dashboard
        </Text>
        <TouchableOpacity
          style={[styles.connectButton, { backgroundColor: theme.primaryColor }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.connectButtonText}>Connect Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: theme.textColor }]}>
          Welcome back, {account.slice(0, 6)}...{account.slice(-4)}
        </Text>
      </View>

      {stats && <StorageStats stats={stats} />}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Recent Files
        </Text>
        <RecentFiles files={recentFiles} onFilePress={(file) => {
          navigation.navigate('Files', { fileId: file.id });
        }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Active Storage Providers
        </Text>
        <StorageProviders />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  connectButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 20,
  },
  connectButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default HomeScreen; 