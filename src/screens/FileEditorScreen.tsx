import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { sshService } from '../services/SSHService';

const FileEditorScreen = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { path } = route.params as { path: string };

  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      try {
        const text = await sshService.readFile(path);
        setContent(text);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [path]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await sshService.writeFile(path, content);
      Alert.alert('Success', 'File saved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Editing: {path}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#E67E22" />
      ) : (
        <TextInput
          style={styles.editor}
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
      )}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save File'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#121212' },
  header: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#E67E22' },
  editor: { 
    flex: 1, 
    backgroundColor: '#1E1E1E',
    color: '#EEE',
    borderWidth: 1, 
    borderColor: '#333', 
    padding: 10, 
    marginBottom: 10, 
    fontFamily: 'monospace',
    fontSize: 14 
  },
  saveButton: {
    backgroundColor: '#E67E22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default FileEditorScreen;
