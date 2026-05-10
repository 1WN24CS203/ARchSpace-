import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UnityView from '@azesmway/react-native-unity';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FURNITURE_CATEGORIES = [
  { id: 'Furniture', label: 'Furniture', icon: '🛋️' },
  { id: 'Material', label: 'Materials', icon: '🧱' },
  { id: 'Structure', label: 'Structure', icon: '🏠' },
  { id: 'Lighting', label: 'Lighting', icon: '💡' },
];

const FURNITURE_ITEMS = {
  Furniture: [
    { name: 'Chair', displayName: 'Modern Chair', price: 199 },
    { name: 'Sofa', displayName: 'Modern Sofa', price: 899 },
    { name: 'Table', displayName: 'Dining Table', price: 499 },
    { name: 'Bed', displayName: 'Modern Bed', price: 1299 },
    { name: 'BeanBag', displayName: 'Bean Bag', price: 149 },
    { name: 'Lamp', displayName: 'Table Lamp', price: 79 },
  ],
  Material: [
    { name: 'Wood', displayName: 'Wood Texture', price: 0 },
    { name: 'Marble', displayName: 'Marble', price: 0 },
    { name: 'Stone', displayName: 'Stone', price: 0 },
  ],
  Structure: [
    { name: 'Wall', displayName: 'Wall Panel', price: 299 },
    { name: 'Floor', displayName: 'Floor Tile', price: 149 },
  ],
  Lighting: [
    { name: 'CeilingLight', displayName: 'Ceiling Light', price: 129 },
    { name: 'FloorLamp', displayName: 'Floor Lamp', price: 189 },
  ],
};

export default function FurnitureScreen() {
  const router = useRouter();
  const unityRef = useRef<UnityView>(null);
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState('Furniture');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [totalBudget, setTotalBudget] = useState(0);
  const [showARView, setShowARView] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedItem(null);

    if (Platform.OS !== 'web' && unityRef.current) {
      unityRef.current.postMessage('RNBridge', 'SetCategory', categoryId);
    }
  };

  const handleItemSelect = (itemName: string) => {
    setSelectedItem(itemName);

    if (Platform.OS !== 'web' && unityRef.current) {
      unityRef.current.postMessage('RNBridge', 'SetItem', itemName);
    }
  };

  const handleStartAR = () => {
    if (Platform.OS === 'web') {
      Alert.alert('AR Not Available', 'AR functionality is only available on Android and iOS devices.');
      return;
    }

    if (unityRef.current) {
      unityRef.current.postMessage('RNBridge', 'EnableRNMode', '');
    }

    setShowARView(true);
  };

  const handleUndo = () => {
    if (unityRef.current) {
      unityRef.current.postMessage('RNBridge', 'Undo', '');
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Design', 'Are you sure you want to clear all placed items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          if (unityRef.current) {
            unityRef.current.postMessage('RNBridge', 'Clear', '');
          }
          setTotalBudget(0);
        },
      },
    ]);
  };

  if (showARView) {
    return <ARViewScreen onExit={() => setShowARView(false)} unityRef={unityRef} insets={insets} />;
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <View style={styles.unityViewHidden}>
          <UnityView
            ref={unityRef}
            style={{ flex: 1 }}
            onUnityMessage={(event) => {
              const message = event.nativeEvent.message;
              console.log('Message from Unity:', message);
            }}
          />
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top ? insets.top + 8 : 8, paddingBottom: 100 },
        ]}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="sofa" size={32} color={Colors.accentGold} />
            <View style={styles.headerText}>
              <Text variant="titleLarge" style={styles.title}>Furniture AR</Text>
              <Text variant="bodySmall" style={styles.subtitle}>Design your space in AR</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacing} />

        <View style={styles.budgetCard}>
          <View>
            <Text variant="labelSmall" style={styles.budgetLabel}>Total Budget</Text>
            <Text variant="titleLarge" style={styles.budgetAmount}>${totalBudget.toFixed(2)}</Text>
          </View>
          <MaterialCommunityIcons name="wallet" size={40} color={Colors.accentGold} />
        </View>

        <View style={styles.spacing} />

        <View style={styles.categorySection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryGrid}>
            {FURNITURE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  activeCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    activeCategory === category.id && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.spacing} />

        <View style={styles.itemsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Available Items</Text>
          <View style={styles.itemsList}>
            {FURNITURE_ITEMS[activeCategory as keyof typeof FURNITURE_ITEMS]?.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.itemCard,
                  selectedItem === item.name && styles.itemCardActive,
                ]}
                onPress={() => handleItemSelect(item.name)}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.displayName}</Text>
                  {item.price > 0 && <Text style={styles.itemPrice}>${item.price}</Text>}
                </View>
                {item.price > 0 && (
                  <Text style={styles.priceNote}>Item price</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.spacing} />

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.undoButton]}
            onPress={handleUndo}
          >
            <MaterialCommunityIcons name="undo" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClear}
          >
            <MaterialCommunityIcons name="trash-can" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Start AR View"
          onPress={handleStartAR}
          variant="solid"
          style={styles.arButton}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

function ARViewScreen(
  {
  onExit,
  unityRef,
  insets,
}: {
  onExit: () => void;
  unityRef: React.RefObject<UnityView>;
  insets: { top: number; bottom: number; left: number; right: number };
}) {
  const [instructions, setInstructions] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInstructions(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestState = () => {
    if (unityRef.current) {
      unityRef.current.postMessage('RNBridge', 'RequestState', '');
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.arContainer}>
        <Text style={styles.unsupportedText}>AR is not available on web</Text>
        <CustomButton title="Go Back" onPress={onExit} variant="solid" />
      </View>
    );
  }

  return (
    <View style={[styles.arContainer, { paddingTop: insets.top }]}>
      <UnityView
        ref={unityRef}
        style={styles.unityView}
        onUnityMessage={(event) => {
          const message = event.nativeEvent.message;
          console.log('AR Message from Unity:', message);
        }}
      />

      {instructions && (
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsBox}>
            <MaterialCommunityIcons name="lightbulb-on" size={32} color={Colors.accentGold} />
            <Text style={styles.instructionsTitle}>AR Tips</Text>
            <Text style={styles.instructionsText}>
              • Point camera at a flat surface{"\n"}
              • Tap to place furniture{"\n"}
              • Use controls below
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.controlPanel, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.controlButton, styles.infoButton]}
          onPress={handleRequestState}
        >
          <MaterialCommunityIcons name="information" size={24} color={Colors.textMain} />
          <Text style={styles.controlButtonText}>Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.exitButton]}
          onPress={onExit}
        >
          <MaterialCommunityIcons name="close" size={24} color={Colors.textMain} />
          <Text style={styles.controlButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {!instructions && (
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setInstructions(true)}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  unityViewHidden: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  spacing: {
    height: 16,
  },
  bottomSpacing: {
    height: 40,
  },
  headerSection: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: Colors.accentGold,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  subtitle: {
    color: Colors.textMuted,
    marginTop: 4,
  },
  budgetCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentGold,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    color: Colors.textMuted,
    marginBottom: 8,
  },
  budgetAmount: {
    color: Colors.accentGold,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  categorySection: {
    paddingHorizontal: 0,
  },
  sectionTitle: {
    color: Colors.textMain,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
  },
  categoryCardActive: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: Colors.accentGold,
    fontFamily: 'Lato-Bold',
  },
  itemsSection: {
    paddingHorizontal: 0,
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
  },
  itemCardActive: {
    borderColor: Colors.accentGold,
    backgroundColor: Colors.primary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    color: Colors.textMain,
    fontSize: 12,
    fontFamily: 'Lato-Bold',
    flex: 1,
  },
  itemPrice: {
    color: Colors.accentGold,
    fontSize: 13,
    fontFamily: 'Lato-Bold',
  },
  priceNote: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'Lato-Regular',
    marginTop: 4,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  undoButton: {
    backgroundColor: Colors.accentGold,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: Colors.primary,
    fontFamily: 'Lato-Bold',
    fontSize: 13,
  },
  arButton: {
    marginHorizontal: 0,
    marginBottom: 24,
  },
  // AR View Styles
  arContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  unityView: {
    flex: 1,
  },
  unsupportedText: {
    flex: 1,
    color: Colors.textMain,
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  instructionsBox: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentGold,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Regular',
    color: Colors.accentGold,
    marginTop: 12,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textMain,
    lineHeight: 22,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoButton: {
    backgroundColor: Colors.accentGold,
  },
  exitButton: {
    backgroundColor: '#FF6B6B',
  },
  controlButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Lato-Bold',
  },
  helpButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  helpButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontFamily: 'Lato-Bold',
  },
});
