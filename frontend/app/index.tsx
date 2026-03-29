import { Stack, Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { createUser } from '@/store/slices/usersSlice';
import type { AppDispatch, RootState } from '@/store';

export default function Home() {
  const creating = useSelector((state: RootState) => state.users.creating);
  const usersError = useSelector((state: RootState) => state.users.error);
  const dispatch = useDispatch<AppDispatch>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormMessage('First name, last name, and email are required.');
      return;
    }

    try {
      await dispatch(
        createUser({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
        })
      ).unwrap();
      setFormMessage('User created successfully. Open Goals to add goals for this profile.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
    } catch {
      setFormMessage('Could not create user. Check API URL/server.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home">
          <Text style={styles.sectionTitle}>Create user</Text>
          <Text style={styles.helperText}>
            New here? Add your details once. Your goals are saved on the server by email.
          </Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone number (optional)"
            keyboardType="phone-pad"
          />
          <Button title={creating ? 'Saving...' : 'Create user'} onPress={onSubmit} />
          {formMessage ? <Text style={styles.messageText}>{formMessage}</Text> : null}
          {usersError ? <Text style={styles.errorText}>{usersError}</Text> : null}
        </ScreenContent>

        <View style={styles.returningBlock}>
          <Text style={styles.returningTitle}>Returning user?</Text>
          <Text style={styles.returningBody}>
            If you already created your profile, tap Goals to view your goal board, select your name,
            and add or review goals.
          </Text>
        </View>

        <Link href={{ pathname: '/details' }} asChild>
          <Button title="Goals" />
        </Link>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  helperText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    alignSelf: 'stretch',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    width: '100%',
  },
  messageText: {
    marginTop: 8,
    color: '#0a7f36',
    alignSelf: 'stretch',
  },
  errorText: {
    marginTop: 8,
    color: '#b00020',
    alignSelf: 'stretch',
  },
  returningBlock: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  returningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },
  returningBody: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
