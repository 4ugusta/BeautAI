import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Coming Soon</Text>
      <Text style={styles.subtitle}>Scan features are on the way</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  text: { fontSize: 20, fontFamily: FONTS.semiBold, color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: TYPOGRAPHY.bodySmall, fontFamily: FONTS.regular, color: COLORS.textSecondary },
});
