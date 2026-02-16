import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { sshService } from '../services/SSHService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const AgentScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Parse commands if they start with /
      let finalCommand = '';
      const trimmedInput = currentInput.trim();
      
      if (trimmedInput.startsWith('/')) {
        const parts = trimmedInput.split(' ');
        const cmd = parts[0].substring(1);
        const args = parts.slice(1).join(' ');
        
        switch (cmd) {
          case 'status':
            finalCommand = 'openclaw status';
            break;
          case 'thinking':
            // Logic for setting thinking could be added to state, 
            // for now we just pass it to the agent command if provided
            finalCommand = `openclaw agent --message "Set thinking to ${args}" --thinking ${args} --session-id "mobile-app-chat"`;
            break;
          default:
            // Fallback for other / commands: try to run them directly or as agent turns
            finalCommand = `openclaw ${cmd} ${args}`;
        }
      } else {
        // Default agent turn - matches the "main" session vibe
        finalCommand = `openclaw agent --message "${currentInput.replace(/"/g, '\\"')}" --session-id "mobile-app-chat"`;
      }

      const response = await sshService.execute(finalCommand);
      
      const agentMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response.trim() || "No response from agent.", 
        isUser: false 
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (error: any) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: `Error: ${error.message}`, 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.agentBubble]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type to OpenClaw..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  listContent: { padding: 15 },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E67E22', // Orange
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
  },
  messageText: { color: '#FFF', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: { color: '#FFF', fontWeight: 'bold' },
});

export default AgentScreen;
