import { useEffect, useMemo, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { hasErrors, validateSignIn } from '../../../domain/auth/validation';
import { Banner, Button, TextField } from '../../../ui/components';
import type { RootStackScreenProps } from '../../../navigation/types';
import {
  authFailureMessage,
  biometricFailureMessage,
  useAuth,
} from '../AuthProvider';
import { AuthLayout } from '../components/AuthLayout';

export const SignInScreen = ({ navigation }: RootStackScreenProps<'SignIn'>) => {
  const {
    state,
    lastEmail,
    signIn,
    dismissFailure,
    unlockWithBiometrics,
  } = useAuth();
  const [email, setEmail] = useState(lastEmail);
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (email.length === 0 && lastEmail.length > 0) {
      setEmail(lastEmail);
    }
  }, [email.length, lastEmail]);

  const errors = useMemo(() => validateSignIn({ email, password }), [email, password]);
  const isPending =
    (state.status === 'signedOut' || state.status === 'locked') && state.pending;
  const failure =
    state.status === 'signedOut' || state.status === 'locked' ? state.failure : null;
  const gateFailure = state.status === 'locked' ? state.gateFailure : null;
  const showBiometrics = state.status === 'locked';

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors(errors)) {
      return;
    }
    void signIn({ email, password });
  };

  const onChange = (setter: (value: string) => void) => (value: string) => {
    if (failure !== null || gateFailure !== null) {
      dismissFailure();
    }
    setter(value);
  };

  const bannerMessage =
    failure !== null
      ? authFailureMessage(failure)
      : gateFailure !== null
        ? biometricFailureMessage(gateFailure)
        : null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your schedule."
      footerPrompt="No account yet?"
      footerAction="Create one"
      onFooterPress={() => navigation.navigate('SignUp')}>
      {bannerMessage !== null ? <Banner tone="danger" message={bannerMessage} /> : null}

      <TextField
        label="Email"
        value={email}
        onChangeText={onChange(setEmail)}
        error={submitted ? errors.email : undefined}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!isPending}
        placeholder="you@example.com"
      />

      <TextField
        label="Password"
        inputRef={passwordRef}
        value={password}
        onChangeText={onChange(setPassword)}
        error={submitted ? errors.password : undefined}
        autoCapitalize="none"
        autoComplete="current-password"
        secureTextEntry
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        editable={!isPending}
        placeholder="Your password"
      />

      <Button
        label="Sign in"
        onPress={handleSubmit}
        loading={isPending}
        accessibilityHint="Signs you in and opens your calendar"
      />

      {showBiometrics ? (
        <Button
          label="Sign in with biometrics"
          variant="secondary"
          onPress={() => {
            void unlockWithBiometrics();
          }}
          disabled={isPending}
          accessibilityHint="Unlocks your calendar with fingerprint or face ID on this device"
        />
      ) : null}
    </AuthLayout>
  );
};
