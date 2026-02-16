import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { sshService } from '../services/SSHService';

const FileExplorerScreen = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { path } = route.params as { path: string };

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const list = await sshService.list(path);
        setFiles(list);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, [path]);

  const handlePress = (file: any) => {
    if (file.isDirectory) {
      // @ts-ignore
      navigation.push('FileExplorer', { path: file.path });
    } else {
      // @ts-ignore
      navigation.navigate('FileEditor', { path: file.path });
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
      <Text style={[styles.itemText, item.isDirectory ? styles.directory : styles.file]}>
        {item.isDirectory ? '📁 ' : '📄 '} {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Path: {path}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.path}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Empty Directory</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 16 },
  directory: { fontWeight: 'bold', color: '#007AFF' },
  file: { color: '#333' },
  empty: { textAlign: 'center', marginTop: 20, color: '#aaa' }
});

export default FileExplorerScreen;
