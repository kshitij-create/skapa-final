import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowRight, Headphones } from 'lucide-react-native';

interface RoomCardProps {
  title: string;
  subtitle: string;
  listenersCount: string;
  moodLabel: string;
  moodType: 'melancholy' | 'hype' | 'lofi';
  avatars: string[];
  isJoined?: boolean;
  onJoinPress?: () => void;
  extraAvatarsCount?: string;
}

const AnimatedEqBar = ({ color, index }: { color: string, index: number }) => {
  const heightAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const minHeight = 4;
    const maxHeight = 16;
    
    // Create random heights and durations based on index to offset them
    const bounce = () => {
      Animated.sequence([
        Animated.timing(heightAnim, {
          toValue: Math.max(minHeight, Math.random() * maxHeight),
          duration: 200 + Math.random() * 200,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: minHeight,
          duration: 200 + Math.random() * 200,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) bounce();
      });
    };

    bounce();
  }, []);

  return (
    <Animated.View style={[styles.eqBar, { backgroundColor: color, height: heightAnim }]} />
  );
};

export const RoomCard = ({
  title, subtitle, listenersCount, moodLabel, moodType, avatars, isJoined, onJoinPress, extraAvatarsCount
}: RoomCardProps) => {
  const getMoodColors = () => {
    switch (moodType) {
      case 'melancholy':
        return {
          gradient: ['rgba(168, 85, 247, 0)', 'rgba(168, 85, 247, 0.6)'] as const,
          glow: 'rgba(168, 85, 247, 0.2)',
          tagText: '#d8b4fe',
          tagBg: 'rgba(168, 85, 247, 0.1)',
          tagBorder: 'rgba(168, 85, 247, 0.2)',
          eqColor: 'rgba(255, 255, 255, 0.6)',
        };
      case 'hype':
        return {
          gradient: ['rgba(245, 158, 11, 0)', 'rgba(245, 158, 11, 0.8)'] as const,
          glow: 'rgba(245, 158, 11, 0.2)',
          tagText: '#fcd34d',
          tagBg: 'rgba(245, 158, 11, 0.1)',
          tagBorder: 'rgba(245, 158, 11, 0.2)',
          eqColor: '#fbbf24',
        };
      case 'lofi':
        return {
          gradient: ['rgba(20, 184, 166, 0)', 'rgba(20, 184, 166, 0.6)'] as const,
          glow: 'rgba(20, 184, 166, 0.2)',
          tagText: '#5eead4',
          tagBg: 'rgba(20, 184, 166, 0.1)',
          tagBorder: 'rgba(20, 184, 166, 0.2)',
          eqColor: 'rgba(255, 255, 255, 0.6)',
        };
      default:
        return {
          gradient: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.6)'] as const,
          glow: 'rgba(255, 255, 255, 0.1)',
          tagText: '#fff',
          tagBg: 'rgba(255, 255, 255, 0.1)',
          tagBorder: 'rgba(255, 255, 255, 0.2)',
          eqColor: 'rgba(255, 255, 255, 0.6)',
        };
    }
  };

  const colors = getMoodColors();

  return (
    <View style={styles.cardContainer}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      
      {/* Glow */}
      <View style={[styles.glow, { backgroundColor: colors.glow }]} />

      <View style={styles.header}>
        <View style={styles.badgesRow}>
          {/* Live Badge */}
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          {/* Mood Badge */}
          <View style={[styles.moodBadge, { backgroundColor: colors.tagBg, borderColor: colors.tagBorder }]}>
            <Text style={[styles.moodText, { color: colors.tagText }]}>{moodLabel}</Text>
          </View>
        </View>

        {/* EQ Bars */}
        <View style={styles.eqContainer}>
          {[1,2,3,4].map((item, idx) => (
            <AnimatedEqBar key={idx} color={colors.eqColor} index={idx} />
          ))}
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>

      <View style={styles.footer}>
        <View style={styles.audienceInfo}>
          <View style={styles.avatarsRow}>
            {avatars.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0 }]} />
            ))}
            {extraAvatarsCount && (
              <View style={[styles.avatar, styles.extraAvatars, { marginLeft: -8 }]}>
                <Text style={styles.extraAvatarsText}>+{extraAvatarsCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.listenersText}>{listenersCount} listening</Text>
        </View>

        {isJoined ? (
          <TouchableOpacity style={styles.joinedButton}>
            <Headphones color="#000" size={16} />
            <Text style={styles.joinedText}>Joined</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={onJoinPress}>
            <Text style={styles.joinText}>Join</Text>
            <ArrowRight color="#000" size={16} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    marginBottom: 16,
  },
  topBorderLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.8,
  },
  gradientFill: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: '12.5%',
    width: '75%',
    height: 32,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#fee2e2',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  moodText: {
    fontSize: 10,
  },
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  eqBar: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
    zIndex: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
    zIndex: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  audienceInfo: {
    flexDirection: 'column',
    gap: 6,
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a0f0a',
  },
  extraAvatars: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraAvatarsText: {
    color: '#fff',
    fontSize: 10,
  },
  listenersText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
  },
  joinedButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinedText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
  },
});
