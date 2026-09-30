import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const BACKEND_URL = 'https://emb-paytech-backend.onrender.com';

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

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const categories = ['Tous', ...new Set(products.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesCategory =
        category === 'Tous' || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [query, category]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartTotal = products.reduce((total, product) => {
    return total + product.price * (cart[product.id] || 0);
  }, 0);

  const addToCart = (id: string) => {
    setCart((previous) => ({
      ...previous,
      [id]: (previous[id] || 0) + 1,
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((previous) => {
      const next = { ...previous };

      if ((next[id] || 0) <= 1) {
        delete next[id];
      } else {
        next[id] -= 1;
      }

      return next;
    });
  };

  const payCart = async () => {
    if (cartCount === 0) {
      alert('Votre panier est vide.');
      return;
    }

    try {
      setLoading(true);

      const items = products
        .filter((product) => cart[product.id])
        .map(
          (product) =>
            `${product.name} x${cart[product.id]}`
        )
        .join(', ');

      const refCommand = `EMB-CART-${Date.now()}`;

      const response = await fetch(`${BACKEND_URL}/payment`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_name: items,
          item_price: cartTotal,
          ref_command: refCommand,
        }),
      });

      const data = await response.json();

      if (data.success === 1 && data.redirect_url) {
        await Linking.openURL(data.redirect_url);
      } else {
        alert(
          data.message || 'Impossible de créer le paiement.'
        );
      }
    } catch (error) {
      alert(
        'Erreur de connexion. Vérifiez Internet et réessayez.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>EMB</Text>
          <Text style={styles.subtitle}>
            Ets Mamadou Barboza
          </Text>
        </View>

        <View style={styles.cartCircle}>
          <Text style={styles.cartNumber}>
            {cartCount}
          </Text>
          <Text style={styles.cartLabel}>PANIER</Text>
        </View>
      </View>

      <Text style={styles.title}>Nos produits</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un produit..."
        placeholderTextColor="#888"
        style={styles.search}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.categoryButton,
              category === item && styles.categoryActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const quantity = cart[item.id] || 0;

          return (
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

                <View style={styles.buttons}>
                  <Pressable
                    style={styles.addButton}
                    onPress={() => addToCart(item.id)}
                  >
                    <Text style={styles.buttonText}>
                      Ajouter
                    </Text>
                  </Pressable>

                  {quantity > 0 && (
                    <View style={styles.quantityBox}>
                      <Pressable
                        style={styles.quantityButton}
                        onPress={() =>
                          removeFromCart(item.id)
                        }
                      >
                        <Text style={styles.quantityText}>
                          −
                        </Text>
                      </Pressable>

                      <Text style={styles.quantity}>
                        {quantity}
                      </Text>

                      <Pressable
                        style={styles.quantityButton}
                        onPress={() =>
                          addToCart(item.id)
                        }
                      >
                        <Text style={styles.quantityText}>
                          +
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.bottom}>
        <View>
          <Text style={styles.totalLabel}>
            Total panier
          </Text>
          <Text style={styles.total}>
            {money(cartTotal)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.payButton,
            cartCount === 0 && styles.payDisabled,
          ]}
          onPress={payCart}
          disabled={loading || cartCount === 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payText}>
              Payer le panier
            </Text>
          )}
        </Pressable>
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
    paddingTop: 16,
    paddingBottom: 8,
  },

  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F28C28',
  },

  subtitle: {
    color: '#555555',
    fontSize: 13,
  },

  cartCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F28C28',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },

  cartLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 10,
  },

  search: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 10,
  },

  categories: {
    marginBottom: 10,
    maxHeight: 45,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginRight: 8,
  },

  categoryActive: {
    backgroundColor: '#F28C28',
    borderColor: '#F28C28',
  },

  categoryText: {
    color: '#555555',
    fontWeight: '700',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  list: {
    paddingBottom: 120,
  },

  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },

  productImage: {
    width: 105,
    height: 105,
    borderRadius: 13,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F28C28',
  },

  productInfo: {
    flex: 1,
    marginLeft: 13,
  },

  productName: {
    fontSize: 17,
    fontWeight: '800',
  },

  category: {
    color: '#777777',
    marginTop: 3,
  },

  price: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 7,
  },

  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  addButton: {
    backgroundColor: '#555555',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 9,
  },

  quantityButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F28C28',
  },

  quantity: {
    minWidth: 25,
    textAlign: 'center',
    fontWeight: '900',
  },

  bottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    color: '#777777',
    fontSize: 12,
  },

  total: {
    fontSize: 18,
    fontWeight: '900',
  },

  payButton: {
    backgroundColor: '#F28C28',
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 17,
    minWidth: 135,
    alignItems: 'center',
  },

  payDisabled: {
    backgroundColor: '#BBBBBB',
  },

  payText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
