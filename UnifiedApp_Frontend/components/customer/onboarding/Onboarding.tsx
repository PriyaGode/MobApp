import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, ImageBackground, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import type { RootStackParamList } from '../../navigation/AppNavigator';

// Define navigation types locally
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  [key: string]: undefined | object;
};

const { width } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  buttonColor: string;
  buttonText: string;
  backgroundImage: string;
}

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem> | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const onboardingData: OnboardingItem[] = [
    {
      id: '1',
      title: 'Welcome to\nAamraj',
      subtitle: 'The King of Fruits, Delivered to Your Doorstep.',
      bgColor: '#1A1A1A',
      buttonColor: '#FFD700',
      buttonText: 'Next',
      backgroundImage: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
    },
    {
      id: '2',
      title: 'Unlock the Best of the Season',
      subtitle: "Get access to deals you won't find anywhere else.",
      bgColor: '#FFF8E7',
      buttonColor: '#FF8C00',
      buttonText: 'Next',
      backgroundImage: 'https://images.pexels.com/photos/2667738/pexels-photo-2667738.jpeg',
    },
    {
      id: '3',
      title: 'Discover Aamraj Mangoes',
      subtitle:
        'Known as the king of mangoes for its rich flavor, unparalleled sweetness, and creamy, non-fibrous texture.',
      bgColor: '#FFFFFF',
      buttonColor: '#FFD700',
      buttonText: 'Next',
      backgroundImage: 'https://images.pexels.com/photos/5875695/pexels-photo-5875695.jpeg',
    },
    {
      id: '4',
      title: 'Fresh Mangoes,\nDelivered Simply',
      subtitle: "We'll deliver farm-fresh mangoes right to your doorstep.",
      bgColor: '#FFFFFF',
      buttonColor: '#FFD700',
      buttonText: 'Get Started',
      backgroundImage: 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg',
    },
  ];

  const goToAuthLanding = () => {
    // If Onboarding is inside a nested navigator, try parent first
    const parentNav = (navigation as any).getParent?.();
    if (parentNav && typeof parentNav.navigate === 'function') {
      parentNav.navigate('AuthLanding');
      return;
    }
    // fallback to current navigator
    navigation.navigate('AuthLanding');
  };

  const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.bgColor }]}>
        <ImageBackground
          source={{ uri: item.backgroundImage }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay} />
          {/* Skip button top-right */}
          <TouchableOpacity style={styles.skipTop} onPress={goToAuthLanding}>
            <Text style={styles.skipTopText}>Skip</Text>
          </TouchableOpacity>
        </ImageBackground>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.pagination}>
            {onboardingData.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  { backgroundColor: i === currentIndex ? '#FFD700' : '#D3D3D3' },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: item.buttonText === 'Get Started' ? '#52B800' : '#FECF03' },
            ]}
            onPress={() => {
              if (index === onboardingData.length - 1) {
                // navigate to AuthLanding on last slide using parent if needed
                goToAuthLanding();
              } else {
                flatListRef.current?.scrollToIndex({
                  index: index + 1,
                  animated: true,
                });
              }
            }}
          >
            <Text style={[styles.buttonText, { color: '#1A1A1A' }]}>
              {item.buttonText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.skipText}>Already a member? Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    setCurrentIndex(idx);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={onboardingData}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    width,
    height: '100%',
    justifyContent: 'space-between',
    
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    flex: 1,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    zIndex: 3,
  },
  skipTop: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipTopText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // ensure full-width button inside footer
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  skipText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
});

export default OnboardingScreen;