import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Dialog,
  Portal,
  Button,
  TextInput,
  Chip,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import Screen from '@/components/common/Screen';
import LoadingState from '@/components/common/LoadingState';
import { useActivities, useCreateActivity, ACTIVITY_KEYS } from '@/hooks/useActivities';
import { activitiesApi } from '@/api/activities.api';
import { useToast } from '@/hooks/useToast';
import { activitySchema, ActivityFormValues } from '@/validations/activity.validation';
import { formatDate } from '@/utils/date';
import { Activity } from '@/types/activity.types';
import { ActivityType, ActivityStatus } from '@/types/common.types';

type FilterType = 'ALL' | ActivityType;

const ACTIVITY_TYPES: ActivityType[] = ['CALL', 'MEETING', 'DEMO', 'EMAIL', 'PROPOSAL', 'REMINDER'];

const INITIAL_VALUES: ActivityFormValues = {
  clientId: undefined as unknown as number,
  activityType: 'CALL',
  activityDate: '',
  activityTime: '',
  details: '',
  reminderDate: '',
  reminderTime: '',
  status: 'PENDING',
};

function StatusChip({ status }: { status: ActivityStatus }) {
  const config: Record<ActivityStatus, { bg: string; color: string }> = {
    PENDING: { bg: '#fef3c7', color: '#b45309' },
    DONE: { bg: '#dcfce7', color: '#15803d' },
    CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
  };
  const c = config[status];
  return (
    <Chip
      compact
      style={{ backgroundColor: c.bg }}
      textStyle={{ color: c.color, fontSize: 11, fontWeight: '700' }}
    >
      {status}
    </Chip>
  );
}

function TypeChip({ type }: { type: ActivityType }) {
  return (
    <Chip
      compact
      style={{ backgroundColor: '#e0f2fe' }}
      textStyle={{ color: '#0369a1', fontSize: 11, fontWeight: '600' }}
    >
      {type}
    </Chip>
  );
}

export default function ActivitiesScreen() {
  const toast = useToast();
  const qc = useQueryClient();

  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [statusDialogActivity, setStatusDialogActivity] = useState<Activity | null>(null);

  const { data: activities, isLoading } = useActivities();
  const createActivity = useCreateActivity();

  const updateActivity = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ActivityStatus }) =>
      activitiesApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIVITY_KEYS.all });
    },
  });

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (filterType === 'ALL') return activities;
    return activities.filter((a: Activity) => a.activityType === filterType);
  }, [activities, filterType]);

  const formik = useFormik<ActivityFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: activitySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        await createActivity.mutateAsync({
          clientId: values.clientId,
          activityType: values.activityType as ActivityType,
          activityDate: values.activityDate,
          activityTime: values.activityTime || undefined,
          details: values.details || undefined,
          reminderDate: values.reminderDate || undefined,
          reminderTime: values.reminderTime || undefined,
          status: (values.status as ActivityStatus) ?? 'PENDING',
        });
        toast.success('Activity added');
        setAddDialogVisible(false);
        helpers.resetForm();
      } catch {
        toast.error('Failed to add activity');
      }
    },
  });

  function openAddDialog() {
    formik.resetForm({ values: INITIAL_VALUES });
    setAddDialogVisible(true);
  }

  function closeAddDialog() {
    setAddDialogVisible(false);
    formik.resetForm();
  }

  async function handleUpdateStatus(status: ActivityStatus) {
    if (!statusDialogActivity) return;
    try {
      await updateActivity.mutateAsync({ id: statusDialogActivity.id, status });
      toast.success(`Marked as ${status.toLowerCase()}`);
      setStatusDialogActivity(null);
    } catch {
      toast.error('Failed to update status');
    }
  }

  const filterButtons = [
    { value: 'ALL', label: 'All' },
    { value: 'CALL', label: 'Call' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'DEMO', label: 'Demo' },
  ];

  if (isLoading) return <LoadingState />;

  return (
    <>
      <Screen>
        <Text variant="headlineSmall" style={styles.heading}>Activities</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <SegmentedButtons
            value={filterType}
            onValueChange={(v) => setFilterType(v as FilterType)}
            buttons={filterButtons}
            style={styles.segmented}
          />
        </ScrollView>

        {!filteredActivities.length ? (
          <Text style={styles.empty}>No activities found.</Text>
        ) : (
          filteredActivities.map((activity: Activity) => (
            <Card
              key={activity.id}
              style={styles.card}
              mode="outlined"
              onPress={() => setStatusDialogActivity(activity)}
            >
              <Card.Content>
                <View style={styles.topRow}>
                  <TypeChip type={activity.activityType} />
                  <StatusChip status={activity.status} />
                </View>
                {!!activity.details && (
                  <Text variant="bodyMedium" style={styles.details} numberOfLines={2}>
                    {activity.details}
                  </Text>
                )}
                <Divider style={styles.divider} />
                <View style={styles.row}>
                  <View>
                    <Text variant="labelSmall" style={styles.label}>Date</Text>
                    <Text variant="bodySmall">{formatDate(activity.activityDate)}</Text>
                  </View>
                  {activity.activityTime && (
                    <View style={styles.alignEnd}>
                      <Text variant="labelSmall" style={styles.label}>Time</Text>
                      <Text variant="bodySmall">{activity.activityTime}</Text>
                    </View>
                  )}
                </View>
                {activity.reminderDate && (
                  <Text variant="bodySmall" style={styles.reminder}>
                    Reminder: {formatDate(activity.reminderDate)}
                  </Text>
                )}
                <Text variant="labelSmall" style={styles.clientId}>
                  Client ID: {activity.clientId}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </Screen>

      <FAB icon="plus" style={styles.fab} onPress={openAddDialog} />

      <Portal>
        {/* Add Activity Dialog */}
        <Dialog visible={addDialogVisible} onDismiss={closeAddDialog}>
          <Dialog.Title>Add Activity</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <TextInput
              label="Client ID *"
              mode="outlined"
              keyboardType="numeric"
              value={formik.values.clientId ? String(formik.values.clientId) : ''}
              onChangeText={(v) => formik.setFieldValue('clientId', v ? Number(v) : undefined)}
              onBlur={() => formik.setFieldTouched('clientId')}
              error={formik.touched.clientId && !!formik.errors.clientId}
              style={styles.input}
            />
            {formik.touched.clientId && formik.errors.clientId && (
              <Text style={styles.errorText}>{formik.errors.clientId}</Text>
            )}

            <Text variant="labelMedium" style={styles.sectionLabel}>Activity Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {ACTIVITY_TYPES.map((type) => (
                <Chip
                  key={type}
                  selected={formik.values.activityType === type}
                  onPress={() => formik.setFieldValue('activityType', type)}
                  style={[
                    styles.typeChip,
                    formik.values.activityType === type && styles.typeChipSelected,
                  ]}
                  textStyle={
                    formik.values.activityType === type ? styles.typeChipTextSelected : undefined
                  }
                >
                  {type}
                </Chip>
              ))}
            </ScrollView>
            {formik.touched.activityType && formik.errors.activityType && (
              <Text style={styles.errorText}>{formik.errors.activityType}</Text>
            )}

            <TextInput
              label="Activity Date *"
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={formik.values.activityDate}
              onChangeText={(v) => formik.setFieldValue('activityDate', v)}
              onBlur={() => formik.setFieldTouched('activityDate')}
              error={formik.touched.activityDate && !!formik.errors.activityDate}
              style={styles.input}
            />
            {formik.touched.activityDate && formik.errors.activityDate && (
              <Text style={styles.errorText}>{formik.errors.activityDate}</Text>
            )}

            <TextInput
              label="Time (HH:MM, optional)"
              mode="outlined"
              placeholder="HH:MM"
              keyboardType="numeric"
              value={formik.values.activityTime ?? ''}
              onChangeText={(v) => formik.setFieldValue('activityTime', v)}
              onBlur={() => formik.setFieldTouched('activityTime')}
              style={styles.input}
            />

            <TextInput
              label="Details (optional)"
              mode="outlined"
              multiline
              numberOfLines={3}
              value={formik.values.details ?? ''}
              onChangeText={(v) => formik.setFieldValue('details', v)}
              onBlur={() => formik.setFieldTouched('details')}
              error={formik.touched.details && !!formik.errors.details}
              style={styles.input}
            />
            {formik.touched.details && formik.errors.details && (
              <Text style={styles.errorText}>{formik.errors.details}</Text>
            )}

            <TextInput
              label="Reminder Date (optional)"
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={formik.values.reminderDate ?? ''}
              onChangeText={(v) => formik.setFieldValue('reminderDate', v)}
              onBlur={() => formik.setFieldTouched('reminderDate')}
              error={formik.touched.reminderDate && !!formik.errors.reminderDate}
              style={styles.input}
            />
            {formik.touched.reminderDate && formik.errors.reminderDate && (
              <Text style={styles.errorText}>{formik.errors.reminderDate}</Text>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeAddDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => formik.handleSubmit()}
              loading={createActivity.isPending}
              disabled={createActivity.isPending}
            >
              Add Activity
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog
          visible={!!statusDialogActivity}
          onDismiss={() => setStatusDialogActivity(null)}
        >
          <Dialog.Title>Update Status</Dialog.Title>
          <Dialog.Content>
            {statusDialogActivity && (
              <>
                <Text variant="bodyMedium" style={styles.statusDialogInfo}>
                  {statusDialogActivity.activityType}
                  {statusDialogActivity.details ? ` · ${statusDialogActivity.details}` : ''}
                </Text>
                <Text variant="bodySmall" style={styles.statusDialogDate}>
                  {formatDate(statusDialogActivity.activityDate)}
                </Text>
                <Text variant="bodySmall" style={styles.currentStatus}>
                  Current: {statusDialogActivity.status}
                </Text>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogActivity(null)}>Close</Button>
            {statusDialogActivity?.status !== 'DONE' && (
              <Button
                mode="contained"
                buttonColor="#15803d"
                onPress={() => handleUpdateStatus('DONE')}
                loading={updateActivity.isPending}
                disabled={updateActivity.isPending}
              >
                Mark Done
              </Button>
            )}
            {statusDialogActivity?.status === 'PENDING' && (
              <Button
                mode="outlined"
                textColor="#64748b"
                onPress={() => handleUpdateStatus('CANCELLED')}
                loading={updateActivity.isPending}
                disabled={updateActivity.isPending}
              >
                Cancel
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 12 },
  filterScroll: { marginBottom: 16 },
  segmented: {},
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  details: { color: '#1e293b', marginBottom: 4 },
  divider: { marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { color: '#64748b', marginBottom: 2 },
  alignEnd: { alignItems: 'flex-end' },
  reminder: { color: '#7c3aed', marginTop: 6 },
  clientId: { color: '#94a3b8', marginTop: 6 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#1a3c5e' },
  scrollArea: { paddingHorizontal: 0, maxHeight: 480 },
  input: { marginBottom: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 4, marginTop: -4 },
  sectionLabel: { color: '#475569', marginBottom: 6, marginTop: 4 },
  typeRow: { flexDirection: 'row', marginBottom: 8 },
  typeChip: { marginRight: 8, backgroundColor: '#f1f5f9' },
  typeChipSelected: { backgroundColor: '#1a3c5e' },
  typeChipTextSelected: { color: '#fff' },
  statusDialogInfo: { color: '#1e293b', marginBottom: 4, fontWeight: '600' },
  statusDialogDate: { color: '#64748b', marginBottom: 4 },
  currentStatus: { color: '#94a3b8', marginTop: 4 },
});
