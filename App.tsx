import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ConnectionScreen from './src/screens/ConnectionScreen';
import FileExplorerScreen from './src/screens/FileExplorerScreen';
import FileEditorScreen from './src/screens/FileEditorScreen';
import AgentScreen from './src/screens/AgentScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Connection"
          screenOptions={{
            headerStyle: { backgroundColor: '#1E1E1E' },
            headerTintColor: '#E67E22',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="Connection" component={ConnectionScreen} />
          <Stack.Screen name="FileExplorer" component={FileExplorerScreen} />
          <Stack.Screen name="FileEditor" component={FileEditorScreen} />
          <Stack.Screen name="Agent" component={AgentScreen} options={{ title: 'OpenClaw Agent' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
