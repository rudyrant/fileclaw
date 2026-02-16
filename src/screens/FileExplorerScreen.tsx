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
      <View style={styles.headerRow}>
        <Text style={styles.header}>Path: {path}</Text>
        <TouchableOpacity 
          style={styles.agentButton} 
          onPress={() => navigation.navigate('Agent' as never)}
        >
          <Text style={styles.agentButtonText}>🤖 Agent</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E67E22" />
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
  container: { flex: 1, backgroundColor: '#121212' },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  header: { fontSize: 14, fontWeight: 'bold', color: '#E67E22', flex: 1 },
  agentButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  agentButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  item: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#222' },
  itemText: { fontSize: 16 },
  directory: { fontWeight: 'bold', color: '#E67E22' },
  file: { color: '#CCC' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' }
});

export default FileExplorerScreen;
