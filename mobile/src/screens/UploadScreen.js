import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { uploadFile } from '../services/api';

const UploadScreen = () => {
  const { account, isConnected } = useWeb3();
  const { theme } = useTheme();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    if (!file) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      setUploading(true);
      await uploadFile(file, account);
      Alert.alert('Success', 'File uploaded successfully');
      setFile(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: theme.primaryColor }]}
        onPress={pickFile}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>Select File</Text>
      </TouchableOpacity>

      {file && (
        <View style={styles.filePreview}>
          {file.type.startsWith('image/') ? (
            <Image
              source={{ uri: file.uri }}
              style={styles.previewImage}
            />
          ) : (
            <Text style={[styles.fileName, { color: theme.textColor }]}>
              {file.name}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.uploadButton,
          { backgroundColor: theme.primaryColor },
          uploading && styles.disabledButton,
        ]}
        onPress={handleUpload}
        disabled={uploading || !file}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload File</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filePreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default UploadScreen; 