/**
 * Enhanced Reactions Bar for Listening Rooms
 * Quick-tap emoji reactions with haptic feedback
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const QUICK_REACTIONS = [
  { emoji: '❤️', label: 'heart' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '👏', label: 'clap' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '😍', label: 'love' },
  { emoji: '🎉', label: 'party' },
  { emoji: '💯', label: 'hundred' },
  { emoji: '🙌', label: 'raise' },
  { emoji: '✨', label: 'sparkles' },
  { emoji: '🎵', label: 'music' },
];

interface EnhancedReactionBarProps {
  onReact: (emoji: string, label: string) => void;
}

export const EnhancedReactionBar: React.FC<EnhancedReactionBarProps> = ({ onReact }) => {
  const handleReaction = (emoji: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReact(emoji, label);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.label}
            style={styles.reactionBtn}
            onPress={() => handleReaction(reaction.emoji, reaction.label)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  reactionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reactionEmoji: {
    fontSize: 26,
  },
});
