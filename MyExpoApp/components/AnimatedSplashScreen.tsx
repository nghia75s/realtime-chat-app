import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Image } from 'expo-image';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence the loading steps
    const timer1 = setTimeout(() => setStep(1), 800);
    const timer2 = setTimeout(() => setStep(2), 1600);
    const timer3 = setTimeout(() => setStep(3), 2400);
    
    // Finish animation after step 3 has been shown for a bit
    const finishTimer = setTimeout(() => {
      onAnimationComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finishTimer);
    };
  }, [onAnimationComplete]);

  return (
    <View style={styles.container}>
      {step === 0 && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={styles.center}>
          <Image source={require('@/assets/images/loading_start.png')} style={styles.logo} contentFit="contain" />
        </Animated.View>
      )}
      
      {step === 1 && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={styles.center}>
          <Image source={require('@/assets/images/loading_middie_1.png')} style={styles.logo} contentFit="contain" />
        </Animated.View>
      )}

      {step === 2 && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={styles.center}>
          <Image source={require('@/assets/images/loading_middie_2.png')} style={styles.logo} contentFit="contain" />
        </Animated.View>
      )}

      {step === 3 && (
        <Animated.View entering={FadeIn.duration(600)} style={styles.doneContainer}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/logo_echat.png')} style={styles.finalLogo} contentFit="contain" />
            <Text style={styles.appName}>E-Chat</Text>
          </View>
          
          <Image source={require('@/assets/images/khau_hieu.png')} style={styles.sloganImage} contentFit="contain" />
          
          <Text style={styles.version}>Version 2.1.0</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 120,
    height: 120,
  },
  doneContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 100,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  finalLogo: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0056D2',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  sloganImage: {
    width: 250,
    height: 250,
  },
  version: {
    fontSize: 16,
    color: '#0056D2',
    fontWeight: '500',
  },
});
