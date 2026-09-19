import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/lib/theme';

export function LoadingState({ message = 'Ładowanie…' }: { message?: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={c.tint} />
      <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const c = useThemeColors();
  return (
    <View style={styles.center}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.message, { color: c.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const c = useThemeColors();
  return (
    <View style={styles.center}>
      <Text style={[styles.title, { color: c.danger }]}>Coś poszło nie tak</Text>
      <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.button, { backgroundColor: c.tint }]}
        >
          <Text style={styles.buttonText}>Spróbuj ponownie</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
    minHeight: 220,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
