import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { FilterChip } from '../components/FilterChip';
import { RoomCard } from '../components/RoomCard';
import { StartRoomCard } from '../components/StartRoomCard';
import { UpcomingDropCard } from '../components/UpcomingDropCard';

const FILTERS = ['All', 'Friends', 'Trending', 'Late Night', 'Lo-Fi', 'Hype'];

export const RoomsScreen = ({ navigation }: any) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const plusRotation = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  // Animation to rotate Plus and show popup
  const togglePopup = () => {
    if (isPopupVisible) {
      Animated.parallel([
        Animated.timing(plusRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setIsPopupVisible(false));
    } else {
      setIsPopupVisible(true);
      Animated.parallel([
        Animated.timing(plusRotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const spin = plusRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  return (
    <View style={styles.container}>
      {/* Warm Glassmorphism Ambience */}
      <View style={styles.ambientLight1} />
      <View style={styles.ambientLight2} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="rgba(255,255,255,0.8)" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={togglePopup}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Plus color="rgba(255,255,255,0.8)" size={20} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Rooms</Text>
          <Text style={styles.subtitle}>3 friends listening now</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTERS.map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                isActive={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
                style={styles.filterChip}
              />
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainScrollContent} showsVerticalScrollIndicator={false}>
          
          <RoomCard
            title="Midnight Drives"
            subtitle="Frank Ocean, SZA, The Weeknd"
            listenersCount="124"
            moodLabel="Melancholy"
            moodType="melancholy"
            avatars={[
              'https://i.pravatar.cc/100?img=11',
              'https://i.pravatar.cc/100?img=12',
              'https://i.pravatar.cc/100?img=13',
            ]}
          />

          <RoomCard
            title="Pre-Workout Mix"
            subtitle="Travis Scott, Drake, Yeat"
            listenersCount="856"
            moodLabel="Hype"
            moodType="hype"
            avatars={[
              'https://i.pravatar.cc/100?img=14',
              'https://i.pravatar.cc/100?img=15',
            ]}
            isJoined
          />

          <RoomCard
            title="Study Beats 📚"
            subtitle="ChilledCow, Nujabes, J Dilla"
            listenersCount="3.2k"
            moodLabel="Lo-Fi"
            moodType="lofi"
            avatars={[
              'https://i.pravatar.cc/100?img=16',
              'https://i.pravatar.cc/100?img=17',
            ]}
            extraAvatarsCount="42"
          />

          <StartRoomCard onPress={togglePopup} />

          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingTitle}>Upcoming Drops</Text>
            <UpcomingDropCard
              title="New Frank Ocean"
              subtitle="Exclusive first listen room"
              timeLabel="Tonight, 9 PM"
              interestedCount="2.3K"
              avatars={[
                'https://i.pravatar.cc/100?img=18',
                'https://i.pravatar.cc/100?img=19',
                'https://i.pravatar.cc/100?img=20',
              ]}
            />
          </View>
          
        </ScrollView>
      </SafeAreaView>

      {/* Popup Overlay */}
      {isPopupVisible && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: popupOpacity, zIndex: 100 }]} pointerEvents={isPopupVisible ? 'auto' : 'none'}>
          <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark">
             <TouchableOpacity style={{ flex: 1 }} onPress={togglePopup} activeOpacity={1} />
          </BlurView>
          
          <Animated.View style={[
            styles.popupCard, 
            { 
              transform: [
                { translateY: popupOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ]
            }
          ]}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Create a Room</Text>
              <TouchableOpacity onPress={togglePopup} style={styles.closeBtn}>
                <X color="#fff" size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.popupContent}>
              <TextInput 
                style={styles.popupInput}
                placeholder="Room Name"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
              <TouchableOpacity style={styles.startBtn} onPress={togglePopup}>
                <Text style={styles.startBtnText}>Start Room</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#140b08',
  },
  ambientLight1: {
    position: 'absolute',
    top: '5%',
    left: '-20%',
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(255, 85, 0, 0.15)',
    transform: [{ scale: 1.5 }],
    opacity: 0.8,
  },
  ambientLight2: {
    position: 'absolute',
    bottom: '20%',
    right: '-20%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    transform: [{ scale: 1.5 }],
    opacity: 0.8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  filtersContainer: {
    paddingBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  upcomingSection: {
    paddingTop: 24,
  },
  upcomingTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  popupCard: {
    position: 'absolute',
    top: 80,
    right: 24,
    width: 260,
    backgroundColor: '#1d1512',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  popupContent: {
    gap: 16,
  },
  popupInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    color: '#fff',
    padding: 12,
    fontSize: 14,
  },
  startBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#000',
    fontWeight: '500',
    fontSize: 14,
  }
});
