import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { fetchUserProfile, updateUserProfile } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { account, isConnected } = useWeb3();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && account) {
      loadProfile();
    }
  }, [isConnected, account]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await fetchUserProfile(account);
      setProfile(userProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      await updateUserProfile(account, updatedProfile);
      Alert.alert('Success', 'Profile updated successfully');
      loadProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.message, { color: theme.textColor }]}>
          Please connect your wallet to view your profile
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.textColor }]}>Profile Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textColor }]}>Wallet Address:</Text>
          <Text style={[styles.value, { color: theme.textColor }]}>
            {account.slice(0, 6)}...{account.slice(-4)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textColor }]}>Total Storage Used:</Text>
          <Text style={[styles.value, { color: theme.textColor }]}>
            {profile?.totalStorageUsed || '0'} GB
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textColor }]}>Files Stored:</Text>
          <Text style={[styles.value, { color: theme.textColor }]}>
            {profile?.filesStored || '0'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textColor }]}>Member Since:</Text>
          <Text style={[styles.value, { color: theme.textColor }]}>
            {profile?.memberSince || 'N/A'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primaryColor }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  profileCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen; 