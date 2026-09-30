import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const products = [
  { id: '1', name: 'Réfrigérateur', price: 185000, category: 'Froid' },
  { id: '2', name: 'Ventilateur sur pied', price: 23000, category: 'Climatisation' },
  { id: '3', name: 'Blender 1.5 L', price: 11000, category: 'Cuisine' },
  { id: '4', name: 'Fer à repasser', price: 12000, category: 'Maison' },
  { id: '5', name: 'Bouilloire 1.7 L', price: 10000, category: 'Cuisine' },
  { id: '6', name: 'Machine à laver', price: 195000, category: 'Lavage' },
];

const money = (value: number) =>
  `${value.toLocaleString('fr-FR')} FCFA`;

export default function Home() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<string[]>([]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>EMB</Text>
          <Text style={styles.subtitle}>
            Ets Mamadou Barboza
          </Text>
        </View>

        <View style={styles.cartBadge}>
          <Text style={styles.cartText}>{cart.length}</Text>
        </View>
      </View>

      <Text style={styles.title}>Nos produits</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un produit..."
        style={styles.search}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.productImage}>
              <Text style={styles.imageText}>EMB</Text>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {item.name}
              </Text>

              <Text style={styles.category}>
                {item.category}
              </Text>

              <Text style={styles.price}>
                {money(item.price)}
              </Text>

              <Pressable
                style={styles.button}
                onPress={() =>
                  setCart((previous) => [...previous, item.id])
                }
              >
                <Text style={styles.buttonText}>
                  Ajouter au panier
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Paiement mobile disponible : Wave • Orange Money
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 12,
  },

  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F28C28',
  },

  subtitle: {
    color: '#555555',
    fontSize: 13,
  },

  cartBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F28C28',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 10,
  },

  search: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    padding: 13,
    marginBottom: 14,
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },

  productImage: {
    width: 95,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F28C28',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 17,
    fontWeight: '700',
  },

  category: {
    color: '#777777',
    marginTop: 2,
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 7,
  },

  button: {
    marginTop: 9,
    backgroundColor: '#F28C28',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignSelf: 'flex-start',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  footer: {
    paddingVertical: 10,
  },

  footerText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
  },
});
