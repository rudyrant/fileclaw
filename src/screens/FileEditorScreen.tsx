import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
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
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TextInput
          style={styles.editor}
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
      )}
      <Button title="Save" onPress={handleSave} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  editor: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginBottom: 10, 
    fontFamily: 'monospace',
    fontSize: 14 
  },
});

export default FileEditorScreen;
