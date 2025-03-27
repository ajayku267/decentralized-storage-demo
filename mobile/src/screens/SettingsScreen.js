import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { updateUserSettings } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const { account, isConnected } = useWeb3();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: false,
    storageLimit: '100',
    preferredNetwork: 'ethereum',
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateUserSettings(account, settings);
      Alert.alert('Success', 'Settings updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.message, { color: theme.textColor }]}>
          Please connect your wallet to access settings
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.textColor }]}>Dark Mode</Text>
          <Switch
            value={theme.isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.primaryColor }}
            thumbColor={theme.isDark ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Storage</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.textColor }]}>Storage Limit (GB)</Text>
          <TextInput
            style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
            value={settings.storageLimit}
            onChangeText={(value) => handleSettingChange('storageLimit', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.textColor }]}>Auto Backup</Text>
          <Switch
            value={settings.autoBackup}
            onValueChange={(value) => handleSettingChange('autoBackup', value)}
            trackColor={{ false: '#767577', true: theme.primaryColor }}
            thumbColor={settings.autoBackup ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.textColor }]}>Enable Notifications</Text>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
            trackColor={{ false: '#767577', true: theme.primaryColor }}
            thumbColor={settings.notifications ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.primaryColor }]}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
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
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'right',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SettingsScreen; 