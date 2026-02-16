import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { sshService } from '../services/SSHService';

const ConnectionScreen = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [initialPath, setInitialPath] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadSaved = async () => {
      const saved = await AsyncStorage.getItem('connection_config');
      if (saved) {
        const config = JSON.parse(saved);
        setHost(config.host);
        setPort(config.port);
        setUsername(config.username);
        setPassword(config.password);
        setInitialPath(config.initialPath || `/home/${config.username}`);
      }
    };
    loadSaved();
  }, []);

  const handleConnect = async () => {
    if (!host || !username) {
      Alert.alert('Error', 'Please enter Host and Username');
      return;
    }

    setLoading(true);
    try {
      await sshService.connect(host, parseInt(port, 10), username, password);
      const config = { host, port, username, password, initialPath };
      await AsyncStorage.setItem('connection_config', JSON.stringify(config));
      
      const targetPath = initialPath || `/home/${username}`;
      // @ts-ignore
      navigation.navigate('FileExplorer', { path: targetPath });
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FileClaw</Text>
      
      <Text style={styles.label}>Host</Text>
      <TextInput style={styles.input} value={host} onChangeText={setHost} placeholder="192.168.1.1" autoCapitalize="none" placeholderTextColor="#666" />

      <Text style={styles.label}>Port</Text>
      <TextInput style={styles.input} value={port} onChangeText={setPort} keyboardType="numeric" placeholderTextColor="#666" />

      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#666" />

      <Text style={styles.label}>Password</Text>
      <TextInput 
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        placeholder="Enter password"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Initial Path (Optional)</Text>
      <TextInput 
        style={styles.input} 
        value={initialPath} 
        onChangeText={setInitialPath} 
        placeholder={`/home/${username || 'user'}`}
        autoCapitalize="none"
        placeholderTextColor="#666"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#E67E22" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleConnect}>
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#121212' },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#E67E22' },
  label: { fontSize: 14, marginBottom: 5, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 },
  input: { 
    backgroundColor: '#1E1E1E', 
    color: '#FFF', 
    borderWidth: 1, 
    borderColor: '#333', 
    padding: 12, 
    marginBottom: 20, 
    borderRadius: 8 
  },
  button: {
    backgroundColor: '#E67E22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default ConnectionScreen;
