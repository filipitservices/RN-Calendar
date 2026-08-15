import { useMemo, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { hasErrors, validateSignIn } from '../../../domain/auth/validation';
import { Banner, Button, TextField } from '../../../ui/components';
import type { RootStackScreenProps } from '../../../navigation/types';
import { authFailureMessage, useAuth } from '../AuthProvider';
import { AuthLayout } from '../components/AuthLayout';

export const SignInScreen = ({ navigation }: RootStackScreenProps<'SignIn'>) => {
  const { state, signIn, dismissFailure } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Errors stay hidden until the first submit so the form does not scold the
  // user while they are still typing.
  const [submitted, setSubmitted] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  const errors = useMemo(() => validateSignIn({ email, password }), [email, password]);
  const isPending = state.status === 'signedOut' && state.pending;
  const failure = state.status === 'signedOut' ? state.failure : null;

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors(errors)) {
      return;
    }
    // No navigation call here: the root navigator swaps screen groups when
    // auth state changes.
    void signIn({ email, password });
  };

  const onChange = (setter: (value: string) => void) => (value: string) => {
    if (failure !== null) {
      dismissFailure();
    }
    setter(value);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your schedule."
      footerPrompt="No account yet?"
      footerAction="Create one"
      onFooterPress={() => navigation.navigate('SignUp')}>
      {failure !== null ? <Banner tone="danger" message={authFailureMessage(failure)} /> : null}

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
    </AuthLayout>
  );
};
