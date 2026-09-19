import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { useThemeColors } from '@/lib/theme';

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const c = useThemeColors();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.tint} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zalogować.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: c.text }]}>GitHub Projekty</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Wklej Personal Access Token (PAT), aby zobaczyć swoje repozytoria.
            Token jest przechowywany lokalnie w bezpiecznym magazynie urządzenia.
          </Text>

          <Text style={[styles.label, { color: c.text }]}>Token GitHub</Text>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="ghp_… lub github_pat_…"
            placeholderTextColor={c.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            multiline={false}
            style={[
              styles.input,
              {
                backgroundColor: c.input,
                borderColor: c.border,
                color: c.text,
              },
            ]}
          />

          {error ? (
            <Text style={[styles.error, { color: c.danger }]}>{error}</Text>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={submitting || !token.trim()}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: c.tint,
                opacity: submitting || !token.trim() ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Zaloguj</Text>
            )}
          </Pressable>

          <View style={[styles.hintBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.hintTitle, { color: c.text }]}>Jak utworzyć PAT?</Text>
            <Text style={[styles.hint, { color: c.textSecondary }]}>
              1. GitHub → Settings → Developer settings → Personal access tokens{'\n'}
              2. Wygeneruj token (classic) ze scope „repo”{'\n'}
              3. Skopiuj i wklej powyżej
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 12 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  error: { fontSize: 14, lineHeight: 20 },
  button: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hintBox: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  hintTitle: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 13, lineHeight: 20 },
});
