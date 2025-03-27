import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TabBar = ({ state, navigation }) => {
  const { theme } = useTheme();

  const getIconName = (routeName) => {
    switch (routeName) {
      case 'Files':
        return 'folder';
      case 'Profile':
        return 'account';
      case 'Settings':
        return 'cog';
      default:
        return 'circle';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconName = getIconName(route.name);

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
            >
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    backgroundColor: isFocused ? theme.primaryColor : 'transparent',
                    transform: [
                      {
                        scale: isFocused ? 1 : 0,
                      },
                    ],
                  },
                ]}
              />
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? theme.primaryColor : theme.secondaryTextColor}
              />
              <Animated.Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? theme.primaryColor : theme.secondaryTextColor,
                    opacity: isFocused ? 1 : 0,
                    transform: [
                      {
                        translateY: isFocused ? 0 : 10,
                      },
                    ],
                  },
                ]}
              >
                {route.name}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 65,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 8,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default TabBar; 