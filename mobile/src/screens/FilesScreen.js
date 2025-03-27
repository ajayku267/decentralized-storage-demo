import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { fetchUserFiles, downloadFile } from '../services/api';

const FilesScreen = ({ navigation }) => {
  const { account, isConnected } = useWeb3();
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && account) {
      loadFiles();
    }
  }, [isConnected, account]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const userFiles = await fetchUserFiles(account);
      setFiles(userFiles);
    } catch (error) {
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.cid);
      Alert.alert('Success', 'File downloaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleShare = async (file) => {
    try {
      await Clipboard.setString(file.cid);
      Alert.alert('Success', 'File CID copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to share file');
    }
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.message, { color: theme.textColor }]}>
          Please connect your wallet to view your files
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
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.cid}
        renderItem={({ item }) => (
          <View style={[styles.fileItem, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.fileName, { color: theme.textColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.fileSize, { color: theme.textColor }]}>
              {item.size} bytes
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primaryColor }]}
                onPress={() => handleDownload(item)}
              >
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.secondaryColor }]}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            No files found
          </Text>
        }
      />
    </View>
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
  fileItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default FilesScreen; 