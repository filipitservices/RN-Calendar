import { useMemo, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { PASSWORD_MIN_LENGTH, hasErrors, validateRegistration } from '../../../domain/auth/validation';
import { Banner, Button, TextField } from '../../../ui/components';
import type { RootStackScreenProps } from '../../../navigation/types';
import { authFailureMessage, useAuth } from '../AuthProvider';
import { AuthLayout } from '../components/AuthLayout';

export const SignUpScreen = ({ navigation }: RootStackScreenProps<'SignUp'>) => {
  const { state, register, dismissFailure } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const errors = useMemo(
    () => validateRegistration({ displayName, email, password }),
    [displayName, email, password],
  );
  const isPending = state.status === 'signedOut' && state.pending;
  const failure = state.status === 'signedOut' ? state.failure : null;

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors(errors)) {
      return;
    }
    void register({ displayName, email, password });
  };

  const onChange = (setter: (value: string) => void) => (value: string) => {
    if (failure !== null) {
      dismissFailure();
    }
    setter(value);
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your calendar in a few seconds."
      footerPrompt="Already registered?"
      footerAction="Sign in"
      onFooterPress={() => navigation.navigate('SignIn')}>
      {failure !== null ? <Banner tone="danger" message={authFailureMessage(failure)} /> : null}

      <TextField
        label="Name"
        value={displayName}
        onChangeText={onChange(setDisplayName)}
        error={submitted ? errors.displayName : undefined}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        editable={!isPending}
        placeholder="Alex Morgan"
      />

      <TextField
        label="Email"
        inputRef={emailRef}
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
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
        autoCapitalize="none"
        autoComplete="new-password"
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        editable={!isPending}
        placeholder="Choose a password"
      />

      <Button
        label="Create account"
        onPress={handleSubmit}
        loading={isPending}
        accessibilityHint="Creates your account and opens your calendar"
      />
    </AuthLayout>
  );
};
