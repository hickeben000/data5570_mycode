import { createElement, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  Text,
  TextInput,
  useWindowDimensions,
} from 'react-native';
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

function WebUserDropdown({
  users,
  selectedUserId,
  onSelectUserId,
}: {
  users: { id: number; first_name: string; last_name: string }[];
  selectedUserId: string;
  onSelectUserId: (id: string) => void;
}) {
  const style: CSSProperties = {
    width: '100%',
    padding: '12px 10px',
    fontSize: 16,
    borderRadius: 8,
    border: '1px solid #ccc',
    marginBottom: 10,
    backgroundColor: '#fff',
  };

  if (users.length === 0) {
    return createElement(
      'select',
      { disabled: true, style },
      createElement('option', { value: '' }, 'No users yet — add one on Home')
    );
  }

  return createElement(
    'select',
    {
      value: selectedUserId,
      style,
      onChange: (e: { target: { value: string } }) => onSelectUserId(e.target.value),
    },
    users.map((u) =>
      createElement(
        'option',
        { key: u.id, value: String(u.id) },
        `${u.first_name} ${u.last_name}`
      )
    )
  );
}

export default function Details() {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch<AppDispatch>();
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
  const isDesktopBoard = width >= 1200;

  const goalsForSelectedUser = useMemo(() => {
    if (!selectedUserId) return [];
    const uid = Number(selectedUserId);
    return goals.filter((g) => g.user === uid);
  }, [goals, selectedUserId]);

  const goalsByFrequency = useMemo(
    () => ({
      daily: goalsForSelectedUser.filter((g) => g.frequency === 'daily'),
      weekly: goalsForSelectedUser.filter((g) => g.frequency === 'weekly'),
      monthly: goalsForSelectedUser.filter((g) => g.frequency === 'monthly'),
      yearly: goalsForSelectedUser.filter((g) => g.frequency === 'yearly'),
    }),
    [goalsForSelectedUser]
  );
  const headerStyleByFrequency = useMemo(
    () => ({
      daily: styles.dailyHeader,
      weekly: styles.weeklyHeader,
      monthly: styles.monthlyHeader,
      yearly: styles.yearlyHeader,
    }),
    []
  );

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
          <Text style={styles.sectionTitle}>Add goal</Text>
          {usersLoading ? <Text>Loading users...</Text> : null}

          <Text style={styles.label}>User</Text>
          {Platform.OS === 'web' ? (
            <WebUserDropdown
              users={users}
              selectedUserId={selectedUserId}
              onSelectUserId={setSelectedUserId}
            />
          ) : (
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
          )}

          <TextInput
            style={styles.input}
            value={goalTitle}
            onChangeText={setGoalTitle}
            placeholder="Goal title"
          />

          <Text style={styles.label}>Frequency</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.webChipRow}>
              {FREQUENCIES.map((f) => {
                const selected = frequency === f.value;
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => setFrequency(f.value)}
                    style={[styles.freqChip, selected && styles.freqChipSelected]}>
                    <Text style={[styles.freqChipText, selected && styles.freqChipTextSelected]}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={frequency}
                onValueChange={(v) => setFrequency(v as (typeof FREQUENCIES)[number]['value'])}>
                {FREQUENCIES.map((f) => (
                  <Picker.Item key={f.value} label={f.label} value={f.value} />
                ))}
              </Picker>
            </View>
          )}

          <Button title={goalsCreating ? 'Saving...' : 'Save goal'} onPress={onCreateGoal} />
          {formMessage ? <Text style={styles.messageText}>{formMessage}</Text> : null}
          {goalsError ? <Text style={styles.errorText}>{goalsError}</Text> : null}

          <Text style={[styles.sectionTitle, styles.listHeading]}>Goals for this user</Text>
          {!selectedUserId ? (
            <Text style={styles.emptyColumnText}>Select a user to see their goals.</Text>
          ) : null}
          {goalsLoading ? <Text>Loading goals...</Text> : null}
          {!goalsLoading && selectedUserId && goalsForSelectedUser.length === 0 ? (
            <Text>No goals for this user yet.</Text>
          ) : null}
          {!goalsLoading && selectedUserId && goalsForSelectedUser.length > 0 ? (
            <View style={styles.columnsRow}>
              {FREQUENCIES.map((frequencyOption) => (
                <View
                  key={frequencyOption.value}
                  style={[styles.column, isDesktopBoard ? styles.columnDesktop : styles.columnMobile]}>
                  <Text
                    style={[styles.columnTitle, headerStyleByFrequency[frequencyOption.value]]}>
                    {frequencyOption.label}
                  </Text>
                  {goalsByFrequency[frequencyOption.value].length === 0 ? (
                    <Text style={styles.emptyColumnText}>No goals</Text>
                  ) : (
                    goalsByFrequency[frequencyOption.value].map((item) => (
                      <View key={item.id} style={styles.card}>
                        <Text style={styles.nameText}>{item.title}</Text>
                      </View>
                    ))
                  )}
                </View>
              ))}
            </View>
          ) : null}
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
  webChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    width: '100%',
  },
  freqChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  freqChipSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  freqChipText: {
    fontSize: 14,
    color: '#111',
  },
  freqChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
  columnsRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 24,
  },
  column: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  columnDesktop: {
    width: '24%',
    minWidth: 220,
  },
  columnMobile: {
    width: '100%',
  },
  columnTitle: {
    fontWeight: '700',
    fontSize: 16,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: '#fff',
    overflow: 'hidden',
  },
  dailyHeader: {
    backgroundColor: '#10b981',
  },
  weeklyHeader: {
    backgroundColor: '#3b82f6',
  },
  monthlyHeader: {
    backgroundColor: '#f59e0b',
  },
  yearlyHeader: {
    backgroundColor: '#8b5cf6',
  },
  emptyColumnText: {
    color: '#666',
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
