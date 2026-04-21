/**
 * ChooseVibeModal — reuses the same mood grid + confetti as onboarding,
 * but as a dismissible modal triggered from the Profile "vibe chip".
 */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInDown,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { MoodChip } from './MoodChip';
import { VibeConfetti } from './VibeConfetti';
import { OnboardingCTA } from './OnboardingCTA';
import { getVibe, setVibe, VIBES, Vibe } from '../state/localStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 10;
const CARD_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

const MOOD_COLORS: Record<string, string> = {
  latenight: '#8A2BE2',
  highenergy: '#f97316',
  focus: '#00E5FF',
  chill: '#0ea5e9',
  sadhours: '#64748b',
  indie: '#ec4899',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved?: (v: Vibe) => void;
}

export const ChooseVibeModal: React.FC<Props> = ({ visible, onClose, onSaved }) => {
  const [activeId, setActiveId] = useState('latenight');
  const [seed, setSeed] = useState(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      getVibe().then(v => v?.id && setActiveId(v.id));
    }
  }, [visible]);

  const selected = VIBES.find(m => m.id === activeId) ?? VIBES[0];
  const color = MOOD_COLORS[activeId] || '#ff8a00';

  const handlePick = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    pulse.value = withSequence(
      withTiming(1.04, { duration: 120, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 6, stiffness: 160 }),
    );
    setSeed(s => s + 1);
  };

  const animPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleSave = async () => {
    const saved = await setVibe({
      id: selected.id,
      emoji: selected.emoji,
      label: selected.label,
    });
    onSaved?.(saved);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={FadeIn.duration(160)} style={StyleSheet.absoluteFill}>
          <View style={styles.bg} />
        </Animated.View>

        <Pressable onPress={e => e.stopPropagation()} style={{ width: '100%' }}>
          <Animated.View
            entering={SlideInDown.springify().damping(16)}
            style={styles.sheet}
          >
            <LinearGradient
              colors={[`${color}1c`, '#0a0a12', '#06060a']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>UPDATE YOUR VIBE</Text>
                <Text style={styles.title}>What are you feeling?</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Grid */}
            <Animated.View style={[styles.gridWrap, animPulse]}>
              <View style={styles.grid}>
                {VIBES.map(m => (
                  <MoodChip
                    key={m.id}
                    emoji={m.emoji}
                    title={m.label}
                    isActive={activeId === m.id}
                    onPress={() => handlePick(m.id)}
                    style={{ width: CARD_SIZE, height: CARD_SIZE * 0.85 }}
                  />
                ))}
              </View>
              <VibeConfetti trigger={seed} color={color} color2="#ffae45" />
            </Animated.View>

            {/* CTA */}
            <Animated.View entering={FadeInUp.delay(140)} style={{ marginTop: 14 }}>
              <OnboardingCTA title={`Set ${selected.label}`} onPress={handleSave} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.82)' },
  sheet: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 10,
    paddingBottom: 34,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  eyebrow: {
    color: 'rgba(255,174,69,0.8)',
    fontSize: 10, fontWeight: '700', letterSpacing: 2.2,
  },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '700',
    letterSpacing: -0.4, marginTop: 4,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  gridWrap: { position: 'relative' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'center',
  },
});
