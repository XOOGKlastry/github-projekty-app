import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/lib/theme';

export default function NotFoundScreen() {
  const c = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Nie znaleziono' }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>Tej strony nie ma.</Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: c.tint, fontWeight: '700' }}>Wróć do listy</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  link: { marginTop: 16, paddingVertical: 12 },
});
