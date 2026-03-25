import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { Stack } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { createGoal, fetchGoals } from '@/store/slices/goalsSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import type { AppDispatch, RootState } from '@/store';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export default function Details() {
  const dispatch = useDispatch<AppDispatch>();
  const count = useSelector((state: RootState) => state.counter.value);
  const users = useSelector((state: RootState) => state.users.items);
  const usersLoading = useSelector((state: RootState) => state.users.loading);
  const goals = useSelector((state: RootState) => state.goals.items);
  const goalsLoading = useSelector((state: RootState) => state.goals.loading);
  const goalsCreating = useSelector((state: RootState) => state.goals.creating);
  const goalsError = useSelector((state: RootState) => state.goals.error);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]['value']>('daily');
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(String(users[0].id));
    }
  }, [users, selectedUserId]);

  const onCreateGoal = async () => {
    if (!selectedUserId) {
      setFormMessage('Create a user on the Home screen first.');
      return;
    }
    if (!goalTitle.trim()) {
      setFormMessage('Enter a goal title.');
      return;
    }

    try {
      await dispatch(
        createGoal({
          user: Number(selectedUserId),
          title: goalTitle.trim(),
          frequency,
        })
      ).unwrap();
      setFormMessage('Goal saved.');
      setGoalTitle('');
    } catch {
      setFormMessage('Could not save goal. Check API URL/server.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Goals' }} />
      <Container>
        <ScreenContent path="app/details.tsx" title="Goal tracking">
          <Text style={styles.countText}>Counter from Redux: {count}</Text>

          <Text style={styles.sectionTitle}>Add goal</Text>
          {usersLoading ? <Text>Loading users...</Text> : null}

          <Text style={styles.label}>User</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedUserId}
              onValueChange={(v) => setSelectedUserId(String(v))}
              enabled={users.length > 0}>
              {users.length === 0 ? (
                <Picker.Item label="No users yet — add one on Home" value="" />
              ) : (
                users.map((u) => (
                  <Picker.Item
                    key={u.id}
                    label={`${u.first_name} ${u.last_name}`}
                    value={String(u.id)}
                  />
                ))
              )}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            value={goalTitle}
            onChangeText={setGoalTitle}
            placeholder="Goal title"
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={frequency} onValueChange={(v) => setFrequency(v)}>
              {FREQUENCIES.map((f) => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>

          <Button title={goalsCreating ? 'Saving...' : 'Save goal'} onPress={onCreateGoal} />
          {formMessage ? <Text style={styles.messageText}>{formMessage}</Text> : null}
          {goalsError ? <Text style={styles.errorText}>{goalsError}</Text> : null}

          <Text style={[styles.sectionTitle, styles.listHeading]}>All goals</Text>
          {goalsLoading ? <Text>Loading goals...</Text> : null}
          <FlatList
            data={goals}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={!goalsLoading ? <Text>No goals yet.</Text> : null}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.nameText}>{item.title}</Text>
                <Text>
                  {item.frequency} · {item.user_name}
                </Text>
              </View>
            )}
          />
        </ScreenContent>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  listHeading: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
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
  listContent: {
    gap: 8,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
  },
  nameText: {
    fontWeight: '700',
    marginBottom: 4,
  },
});
