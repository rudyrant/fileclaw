import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { sshService } from '../services/SSHService';

const ConnectionScreen = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      await AsyncStorage.setItem('connection_config', JSON.stringify({ host, port, username, password }));
      // @ts-ignore
      navigation.navigate('FileExplorer', { path: '/home/user' });
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connect to Server</Text>
      
      <Text style={styles.label}>Host</Text>
      <TextInput style={styles.input} value={host} onChangeText={setHost} placeholder="192.168.1.1" autoCapitalize="none" />

      <Text style={styles.label}>Port</Text>
      <TextInput style={styles.input} value={port} onChangeText={setPort} keyboardType="numeric" />

      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

      <Text style={styles.label}>Password (or Private Key path)</Text>
      <TextInput 
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        placeholder="Enter password"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Connect" onPress={handleConnect} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
});

export default ConnectionScreen;
