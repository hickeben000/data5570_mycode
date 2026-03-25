import { Stack, Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { increment, decrement } from '@/store/slices/counterSlice';
import { createUser } from '@/store/slices/usersSlice';
import type { AppDispatch, RootState } from '@/store';

export default function Home() {
  const count = useSelector((state: RootState) => state.counter.value);
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
      setFormMessage('User created successfully. Add goals on the next screen.');
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
          <Text style={styles.countText}>Counter: {count}</Text>
          <View style={styles.buttonRow}>
            <Button title="− Decrement" onPress={() => dispatch(decrement())} />
            <Button title="+ Increment" onPress={() => dispatch(increment())} />
          </View>
          <Text style={styles.sectionTitle}>Create User</Text>
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
          <Button title={creating ? 'Saving...' : 'Create User'} onPress={onSubmit} />
          {formMessage ? <Text style={styles.messageText}>{formMessage}</Text> : null}
          {usersError ? <Text style={styles.errorText}>{usersError}</Text> : null}
        </ScreenContent>
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
  countText: {
    fontSize: 18,
    marginVertical: 12,
  },
  buttonRow: {
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
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
  },
  errorText: {
    marginTop: 8,
    color: '#b00020',
  },
});
