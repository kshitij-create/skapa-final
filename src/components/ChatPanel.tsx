/**
 * Chat Panel Component for Listening Rooms
 * Sliding panel with messages, input, and smooth animations
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'react-native';
import { MOCK_ROOM_CHAT, chatActions, type ChatMessage } from '../state/roomChatData';

const { width, height } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.85;

interface ChatPanelProps {
  visible: boolean;
  onClose: () => void;
  roomCode: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ visible, onClose, roomCode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_ROOM_CHAT);
  const [inputText, setInputText] = useState('');
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : PANEL_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const result = await chatActions.sendMessage(roomCode, inputText);
    if (result.success && result.message) {
      setMessages([...messages, result.message]);
      setInputText('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
      </TouchableOpacity>

      {/* Chat Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#0a0a0a', '#050505']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Room Chat</Text>
            <Text style={styles.headerSubtitle}>{messages.length} messages</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              timeAgo={getTimeAgo(msg.timestamp)}
            />
          ))}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Message the room..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={250}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                disabled={!inputText.trim()}
              >
                <LinearGradient
                  colors={inputText.trim() ? ['#ff8a00', '#ffae45'] : ['#333', '#333']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons
                  name="send"
                  size={18}
                  color={inputText.trim() ? '#000' : '#666'}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.charCount}>{inputText.length}/250</Text>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: ChatMessage; timeAgo: string }> = ({
  message,
  timeAgo,
}) => {
  const isCurrentUser = message.userName === 'You';

  return (
    <View style={[styles.messageBubble, isCurrentUser && styles.messageBubbleOwn]}>
      {!isCurrentUser && (
        <Image source={{ uri: message.userAvatar }} style={styles.messageAvatar} />
      )}
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName}>
            {message.userName}
            {message.isHost && <Text style={styles.hostBadge}> 👑</Text>}
          </Text>
          <Text style={styles.messageTime}>{timeAgo}</Text>
        </View>
        
        <View style={[styles.messageBubbleInner, isCurrentUser && styles.messageBubbleInnerOwn]}>
          <Text style={[styles.messageText, isCurrentUser && styles.messageTextOwn]}>
            {message.message}
          </Text>
        </View>
      </View>

      {isCurrentUser && (
        <Image source={{ uri: message.userAvatar }} style={styles.messageAvatar} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    overflow: 'hidden',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  messageBubbleOwn: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 4,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  messageName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  hostBadge: {
    fontSize: 11,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  messageBubbleInner: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '85%',
  },
  messageBubbleInnerOwn: {
    backgroundColor: 'rgba(255,138,0,0.15)',
    borderRadius: 16,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.2)',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#fff',
  },
  
  // Input
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0a0a0a',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  charCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
    textAlign: 'right',
  },
});
