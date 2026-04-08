import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, TextInput, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { CustomButton } from '@/components/CustomButton';

// Mock catalog of materials
const MATERIAL_CATALOG = [
  { id: 'm1', name: 'Italian Calacatta Marble', category: 'Tiles', price: 25 },
  { id: 'm2', name: 'Matte Black Ceramic', category: 'Tiles', price: 12 },
  { id: 'm3', name: 'Walnut Hardwood', category: 'Wood', price: 18 },
  { id: 'm4', name: 'Obsidian Black Paint', category: 'Paint', price: 45 },
  { id: 'm5', name: 'Gold Accent Wallpaper', category: 'Wallpaper', price: 60 }
];

interface SelectedItem {
  id: string;
  material: typeof MATERIAL_CATALOG[0];
  quantity: string;
}

export default function BudgetScreen() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const addMaterial = (material: typeof MATERIAL_CATALOG[0]) => {
    // If already exists, ignore
    if (selectedItems.find(i => i.material.id === material.id)) return;

    setSelectedItems([
      ...selectedItems,
      { id: Date.now().toString(), material, quantity: '100' } // Default quantity
    ]);
  };

  const updateQuantity = (id: string, newQty: string) => {
    setSelectedItems(selectedItems.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      return sum + (qty * item.material.price);
    }, 0);
  };

  const totalBudget = calculateTotal();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Material Catalog</Text>
          <Text variant="bodySmall" style={styles.helperText}>Tap to add to your estimate</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catalogScroll}>
            {MATERIAL_CATALOG.map(mat => (
              <TouchableOpacity key={mat.id} onPress={() => addMaterial(mat)}>
                <Surface style={styles.catalogItem} elevation={1}>
                  <View style={styles.badge}><Text style={styles.badgeText}>{mat.category}</Text></View>
                  <Text variant="bodyMedium" style={styles.catalogName} numberOfLines={2}>{mat.name}</Text>
                  <Text variant="bodySmall" style={styles.catalogPrice}>₹{mat.price} / unit</Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Budget Breakdown</Text>

          {selectedItems.length === 0 ? (
            <Text style={styles.emptyText}>No materials selected yet.</Text>
          ) : (
            selectedItems.map((item) => {
              const itemTotal = (parseFloat(item.quantity) || 0) * item.material.price;

              return (
                <View key={item.id} style={styles.breakdownRow}>
                  <View style={styles.breakdownInfo}>
                    <Text variant="titleMedium" style={styles.breakdownName}>{item.material.name}</Text>
                    <Text variant="bodySmall" style={styles.breakdownPrice}>₹{item.material.price} / unit</Text>
                  </View>

                  <View style={styles.breakdownControls}>
                    <TextInput
                      mode="outlined"
                      label="Qty"
                      value={item.quantity}
                      onChangeText={(val) => updateQuantity(item.id, val)}
                      keyboardType="numeric"
                      style={styles.qtyInput}
                      activeOutlineColor={Colors.accentGold}
                      textColor={Colors.textMain}
                      theme={{ colors: { onSurfaceVariant: Colors.textMuted, background: 'transparent' } }}
                    />
                    <Text variant="titleMedium" style={styles.itemTotal}>
                      ₹{itemTotal.toLocaleString()}
                    </Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                      <MaterialCommunityIcons name="close-circle" size={24} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Total */}
      <Surface style={styles.bottomBar} elevation={4}>
        <View style={styles.totalRow}>
          <Text variant="titleMedium" style={styles.totalLabel}>Total Estimate</Text>
          <Text variant="displaySmall" style={styles.totalValue}>
            ₹{totalBudget.toLocaleString()}
          </Text>
        </View>
        <CustomButton title="Save Estimate" onPress={() => { }} variant="gold" style={styles.saveBtn} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textMain,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 4,
  },
  helperText: {
    color: Colors.textMuted,
    marginBottom: 16,
  },
  catalogScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  catalogItem: {
    width: 140,
    height: 120,
    backgroundColor: Colors.card,
    marginRight: 12,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.accentGoldHover,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  catalogName: {
    color: Colors.textMain,
    fontFamily: 'Lato-Bold',
  },
  catalogPrice: {
    color: Colors.textMuted,
  },
  divider: {
    backgroundColor: Colors.borderSubtle,
    marginVertical: 16,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'Lato-Regular',
  },
  breakdownRow: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  breakdownInfo: {
    marginBottom: 12,
  },
  breakdownName: {
    color: Colors.accentGoldHover,
    fontFamily: 'Lato-Bold',
  },
  breakdownPrice: {
    color: Colors.textMuted,
  },
  breakdownControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyInput: {
    width: 80,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  itemTotal: {
    color: Colors.textMain,
    flex: 1,
    textAlign: 'right',
    marginRight: 16,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  removeBtn: {
    padding: 4,
  },
  bottomBar: {
    backgroundColor: Colors.card,
    padding: 24,
    paddingBottom: 40, // safe area padding
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalLabel: {
    color: Colors.textMuted,
    fontFamily: 'Lato-Regular',
    marginBottom: 8,
  },
  totalValue: {
    color: Colors.accentGoldHover,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  saveBtn: {
    width: '100%',
  }
});
