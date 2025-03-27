import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Web3Provider } from './src/context/Web3Context';
import { ThemeProvider } from './src/context/ThemeContext';
import TabBar from './src/components/TabBar';
import Header from './src/components/Header';

// Screens
import FilesScreen from './src/screens/FilesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ navigation, route, options }) => (
          <Header
            title={route.name}
            showBack={navigation.canGoBack()}
            onBackPress={() => navigation.goBack()}
            rightComponent={options.headerRight}
          />
        ),
      }}
    >
      <Stack.Screen name="Files" component={FilesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <Web3Provider>
      <ThemeProvider>
        <NavigationContainer>
          <Tab.Navigator
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Tab.Screen name="Files" component={MainStack} />
            <Tab.Screen name="Profile" component={MainStack} />
            <Tab.Screen name="Settings" component={MainStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </Web3Provider>
  );
};

export default App; 