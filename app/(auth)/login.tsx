import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth-store';
import { COLORS, SPACING, FONTS, TYPOGRAPHY } from '../../constants/theme';
import DownIcon from '../../assets/icons/onboarding/screen1/Down.svg';
import ShowIcon from '../../assets/icons/onboarding/screen1/Show.svg';
import CheckIcon from '../../assets/icons/onboarding/screen2/Check.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

interface DomainOption {
  label: string;
  value: string;
}

const DOMAIN_OPTIONS: DomainOption[] = [
  { label: '@gmail.com', value: '@gmail.com' },
  { label: '@outlook.com', value: '@outlook.com' },
  { label: '@yahoo.com', value: '@yahoo.com' },
  { label: '@icloud.com', value: '@icloud.com' },
];

export default function LoginScreen() {
  const [emailUsername, setEmailUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('@gmail.com');
  const [showDomainModal, setShowDomainModal] = useState(false);

  const { signIn, isLoading, error, clearError } = useAuthStore();

  const getFullEmail = (): string => {
    const username = emailUsername.trim();
    // If user typed a full email (contains @), use it as-is
    if (username.includes('@')) {
      return username;
    }
    // Otherwise append the selected domain
    return `${username}${selectedDomain}`;
  };

  const validateEmail = (fullEmail: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailUsername.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(fullEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignIn = async () => {
    clearError();
    const fullEmail = getFullEmail();
    const isEmailValid = validateEmail(fullEmail);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;
    await signIn(fullEmail, password);
  };

  const handleSelectDomain = (domain: string) => {
    setSelectedDomain(domain);
    setShowDomainModal(false);
  };

  const renderDomainItem = ({ item }: { item: DomainOption }) => (
    <TouchableOpacity
      style={styles.domainItem}
      onPress={() => handleSelectDomain(item.value)}
    >
      <Text
        style={[
          styles.domainItemText,
          item.value === selectedDomain && styles.domainItemTextSelected,
        ]}
      >
        {item.label}
      </Text>
      {item.value === selectedDomain && (
        <CheckIcon width={18 * scale} height={18 * scale} />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline in upper portion */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Personalised beauty. Powered by you.
          </Text>
        </View>

        {/* Flex spacer pushes form to bottom */}
        <View style={styles.spacer} />

        {/* Form section at bottom */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={emailUsername}
                onChangeText={(text) => {
                  setEmailUsername(text);
                  if (emailError) setEmailError('');
                  if (error) clearError();
                }}
                placeholder="xyz@email.com"
                placeholderTextColor="#bdbdbd"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                style={[styles.input, emailError ? styles.inputError : undefined]}
              />
              <TouchableOpacity
                style={styles.emailHint}
                onPress={() => setShowDomainModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.hintText}>{selectedDomain}</Text>
                <DownIcon
                  width={16 * scale}
                  height={16 * scale}
                  style={{ marginLeft: 4 * scale }}
                />
              </TouchableOpacity>
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                  if (error) clearError();
                }}
                placeholder="••••••••••"
                placeholderTextColor="#bdbdbd"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect={false}
                style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : undefined]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <Ionicons name="eye-off-outline" size={16 * scale} color={COLORS.textPrimary} />
                ) : (
                  <ShowIcon width={16 * scale} height={16 * scale} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          ) : null}

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            style={[styles.button, styles.primaryButton, isLoading ? styles.buttonDisabled : undefined]}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Get Started</Text>
            )}
          </TouchableOpacity>

          {/* Divider — just "or" text, no horizontal lines */}
          <View style={styles.divider}>
            <Text style={styles.dividerText}>or</Text>
          </View>

          {/* Continue With Apple Button */}
          <TouchableOpacity style={[styles.button, styles.appleButton]}>
            <Text style={styles.appleButtonText}>Continue With Apple</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Domain Selection Modal */}
      <Modal
        visible={showDomainModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDomainModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDomainModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Email Domain</Text>
            <FlatList
              data={DOMAIN_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={renderDomainItem}
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenPadding * scale,
  },
  headlineContainer: {
    marginTop: 205 * scale,
    paddingHorizontal: 24 * scale,
    alignItems: 'center',
  },
  headline: {
    fontSize: TYPOGRAPHY.headlineLarge * scale,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 44 * scale,
    letterSpacing: -1.6 * scale,
    color: COLORS.textPrimary,
  },
  spacer: {
    flex: 1,
    minHeight: 0,
  },
  formContainer: {
    paddingBottom: 44 * scale,
  },
  inputGroup: {
    marginBottom: 12 * scale,
  },
  label: {
    fontSize: TYPOGRAPHY.label * scale,
    fontFamily: FONTS.regular,
    marginBottom: 4 * scale,
    paddingLeft: 12 * scale,
    letterSpacing: -0.2 * scale,
    color: COLORS.textPrimary,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    paddingHorizontal: 12 * scale,
    fontSize: TYPOGRAPHY.body * scale,
    fontFamily: FONTS.regular,
    borderRadius: SPACING.inputRadius * scale,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    height: 42 * scale,
    letterSpacing: -0.35 * scale,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordInput: {
    paddingRight: 44 * scale,
  },
  emailHint: {
    position: 'absolute',
    right: 12 * scale,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    fontSize: TYPOGRAPHY.body * scale,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    letterSpacing: -0.35 * scale,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12 * scale,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.label * scale,
    fontFamily: FONTS.regular,
    marginTop: 4 * scale,
    paddingLeft: 12 * scale,
    letterSpacing: -0.2 * scale,
    color: '#EF4444',
  },
  errorContainer: {
    marginBottom: 12 * scale,
    padding: 12 * scale,
    borderRadius: SPACING.inputRadius * scale,
    backgroundColor: '#FEE2E2',
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    color: '#DC2626',
  },
  button: {
    height: SPACING.buttonHeight * scale,
    borderRadius: SPACING.buttonRadius * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginTop: 8 * scale,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.button * scale,
    fontFamily: FONTS.semiBold,
    letterSpacing: -0.4 * scale,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 12 * scale,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.body * scale,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    letterSpacing: -0.35 * scale,
  },
  appleButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  appleButtonText: {
    fontSize: TYPOGRAPHY.button * scale,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.4 * scale,
  },
  // Domain Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16 * scale,
    padding: 20 * scale,
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320 * scale,
  },
  modalTitle: {
    fontSize: 16 * scale,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 16 * scale,
    textAlign: 'center',
    letterSpacing: -0.4 * scale,
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14 * scale,
    paddingHorizontal: 12 * scale,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  domainItemText: {
    fontSize: TYPOGRAPHY.body * scale,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    letterSpacing: -0.35 * scale,
  },
  domainItemTextSelected: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});
