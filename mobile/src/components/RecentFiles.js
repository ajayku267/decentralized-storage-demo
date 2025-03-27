import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RecentFiles = ({ files, onFilePress }) => {
  const { theme } = useTheme();

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'music';
      case 'document':
        return 'file-document';
      default:
        return 'file';
    }
  };

  const renderFileItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.fileItemContainer,
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
        style={[styles.fileItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => onFilePress(item)}
      >
        <View style={[styles.fileIcon, { backgroundColor: theme.secondaryBackground }]}>
          <Icon
            name={getFileIcon(item.type)}
            size={24}
            color={theme.primaryColor}
          />
        </View>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: theme.textColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.fileSize, { color: theme.secondaryTextColor }]}>
            {formatBytes(item.size)}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={theme.secondaryTextColor} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondaryBackground }]}>
          <Icon name="clock-outline" size={24} color={theme.primaryColor} />
        </View>
        <Text style={[styles.title, { color: theme.textColor }]}>Recent Files</Text>
      </View>

      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="file-outline" size={48} color={theme.secondaryTextColor} />
            <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
              No recent files
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
  fileItemContainer: {
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
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

export default RecentFiles; 