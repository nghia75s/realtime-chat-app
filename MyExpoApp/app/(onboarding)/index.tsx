import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Group Chatting',
    description: 'Connect with multiple members in\ngroup chats.',
    image: require('@/assets/images/introlduction_step_1.png'),
  },
  {
    id: '2',
    title: 'Video And Voice Calls',
    description: 'Instantly connect via video and voice calls.',
    image: require('@/assets/images/introlduction_step_2.png'),
  },
  {
    id: '3',
    title: 'Message Encryption',
    description: 'Ensure privacy with encrypted messages.',
    image: require('@/assets/images/introlduction_step_3.png'),
  },
  {
    id: '4',
    title: 'Cross-Platform\nCompatibility',
    description: 'Access chats on any device seamlessly.',
    image: require('@/assets/images/introlduction_step_4.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();

  const handleComplete = async () => {
    await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: typeof ONBOARDING_DATA[0] }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} contentFit="contain" />
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>Get started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        bounces={false}
      />
      
      {/* Absolute Bottom Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handleComplete} style={styles.navButton}>
          <Text style={styles.navText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.navButton}>
          <Text style={styles.navText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: 300,
  },
  bottomContainer: {
    flex: 0.45,
    backgroundColor: '#E6F4FF', // Light blue background from design
    width: '100%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    height: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0056D2',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00A3FF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  navButton: {
    padding: 10,
  },
  navText: {
    color: '#00A3FF',
    fontSize: 16,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#00A3FF',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#B3E0FF',
  },
});
