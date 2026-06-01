import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  FAB,
  Chip,
  IconButton,
  Dialog,
  Portal,
  Button,
  TextInput,
  HelperText,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import { useFamilies, useCreateFamily, useUpdateFamily } from '@/hooks/useFamilies';
import { useToast } from '@/hooks/useToast';
import { familySchema, FamilyFormValues } from '@/validations/family.validation';
import { FamilyListItem } from '@/types/family.types';
import Screen from '@/components/common/Screen';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

const INITIAL_VALUES: FamilyFormValues = {
  familyCode: '',
  headName: '',
  address: '',
  mobile: '',
  email: '',
  pincode: '',
  religion: '',
  designation: '',
};

export default function FamiliesScreen() {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyListItem | null>(null);

  const { data, isLoading, isError, refetch } = useFamilies({ search: search || undefined });
  const createFamily = useCreateFamily();
  const updateFamily = useUpdateFamily(editingFamily?.familyCode ?? '');

  const openAdd = useCallback(() => {
    setEditingFamily(null);
    setDialogVisible(true);
  }, []);

  const openEdit = useCallback((family: FamilyListItem) => {
    setEditingFamily(family);
    setDialogVisible(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogVisible(false);
    setEditingFamily(null);
  }, []);

  const formik = useFormik<FamilyFormValues>({
    initialValues: editingFamily
      ? {
          familyCode: editingFamily.familyCode ?? '',
          headName: editingFamily.headName ?? '',
          address: editingFamily.address ?? '',
          mobile: editingFamily.mobile ?? '',
          email: "",
          pincode: editingFamily.pincode ?? '',
          religion: "",
          designation: "",
        }
      : INITIAL_VALUES,
    enableReinitialize: true,
    validationSchema: familySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        const payload = {
          ...values,
          familyCode: values.familyCode || undefined,
        };
        if (editingFamily) {
          await updateFamily.mutateAsync(payload);
          toast.success('Family updated successfully');
        } else {
          await createFamily.mutateAsync(payload);
          toast.success('Family added successfully');
        }
        helpers.resetForm();
        closeDialog();
      } catch {
        toast.error(editingFamily ? 'Failed to update family' : 'Failed to add family');
      }
    },
  });

  const families = data?.data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: FamilyListItem }) => (
      <Card
        mode="outlined"
        style={styles.card}
        onPress={() => router.push(`/(app)/family/${item.familyCode}`)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium" style={styles.headName}>{item.headName}</Text>
              <Text variant="bodySmall" style={styles.familyCode}>{item.familyCode}</Text>
              {item.mobile ? (
                <Text variant="bodySmall" style={styles.meta}>{item.mobile}</Text>
              ) : null}
            </View>
            <View style={styles.cardRight}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openEdit(item)}
                style={styles.editBtn}
              />
              <View style={styles.badges}>
                <Chip compact style={styles.memberChip} textStyle={styles.chipText}>
                  {item.memberCount} members
                </Chip>
                <Chip compact style={styles.policyChip} textStyle={styles.chipText}>
                  {item.policyCount} policies
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    ),
    [router, openEdit],
  );

  const renderHeader = () => (
    <View>
      <Searchbar
        placeholder="Search families..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />
      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
        </View>
      )}
      {isError && !isLoading && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && families.length === 0 && (
        <EmptyState
          title="No families found"
          message={search ? 'Try a different search term.' : 'Add your first family using the + button.'}
          icon="account-group-outline"
        />
      )}
    </View>
  );

  return (
    <Screen scroll={false} style={styles.root}>
      <View style={styles.titleRow}>
        <Text variant="headlineSmall" style={styles.pageTitle}>Families</Text>
        {data?.total != null && (
          <Chip style={styles.totalChip} textStyle={styles.totalChipText}>{data.total}</Chip>
        )}
      </View>

      <FlatList
        data={families}
        keyExtractor={(item) => item.familyCode}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAdd}
        label="Add Family"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
          <Dialog.Title>{editingFamily ? 'Edit Family' : 'Add Family'}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <View style={styles.form}>
              <TextInput
                label="Family Code (optional)"
                mode="outlined"
                value={formik.values.familyCode}
                onChangeText={formik.handleChange('familyCode')}
                onBlur={formik.handleBlur('familyCode')}
                error={!!(formik.touched.familyCode && formik.errors.familyCode)}
                autoCapitalize="characters"
                style={styles.input}
                disabled={!!editingFamily}
              />
              <HelperText type={formik.touched.familyCode && formik.errors.familyCode ? 'error' : 'info'}>
                {formik.touched.familyCode && formik.errors.familyCode
                  ? formik.errors.familyCode
                  : 'Leave blank for auto-generated code'}
              </HelperText>

              <TextInput
                label="Head Name *"
                mode="outlined"
                value={formik.values.headName}
                onChangeText={formik.handleChange('headName')}
                onBlur={formik.handleBlur('headName')}
                error={!!(formik.touched.headName && formik.errors.headName)}
                style={styles.input}
              />
              <HelperText type="error" visible={!!(formik.touched.headName && formik.errors.headName)}>
                {formik.errors.headName}
              </HelperText>

              <TextInput
                label="Mobile"
                mode="outlined"
                value={formik.values.mobile}
                onChangeText={formik.handleChange('mobile')}
                onBlur={formik.handleBlur('mobile')}
                error={!!(formik.touched.mobile && formik.errors.mobile)}
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.input}
              />
              <HelperText type="error" visible={!!(formik.touched.mobile && formik.errors.mobile)}>
                {formik.errors.mobile}
              </HelperText>

              <TextInput
                label="Address"
                mode="outlined"
                value={formik.values.address}
                onChangeText={formik.handleChange('address')}
                onBlur={formik.handleBlur('address')}
                error={!!(formik.touched.address && formik.errors.address)}
                multiline
                numberOfLines={2}
                style={styles.input}
              />
              <HelperText type="error" visible={!!(formik.touched.address && formik.errors.address)}>
                {formik.errors.address}
              </HelperText>

              <TextInput
                label="Email"
                mode="outlined"
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                error={!!(formik.touched.email && formik.errors.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <HelperText type="error" visible={!!(formik.touched.email && formik.errors.email)}>
                {formik.errors.email}
              </HelperText>

              <TextInput
                label="Pincode"
                mode="outlined"
                value={formik.values.pincode}
                onChangeText={formik.handleChange('pincode')}
                onBlur={formik.handleBlur('pincode')}
                error={!!(formik.touched.pincode && formik.errors.pincode)}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />
              <HelperText type="error" visible={!!(formik.touched.pincode && formik.errors.pincode)}>
                {formik.errors.pincode}
              </HelperText>

              <TextInput
                label="Religion"
                mode="outlined"
                value={formik.values.religion}
                onChangeText={formik.handleChange('religion')}
                onBlur={formik.handleBlur('religion')}
                style={styles.input}
              />

              <TextInput
                label="Designation"
                mode="outlined"
                value={formik.values.designation}
                onChangeText={formik.handleChange('designation')}
                onBlur={formik.handleBlur('designation')}
                style={styles.input}
              />
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => formik.handleSubmit()}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              contentStyle={styles.submitBtn}
            >
              {editingFamily ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  pageTitle: { fontWeight: '800', color: '#0d2137', flex: 1 },
  totalChip: { backgroundColor: '#dbeafe' },
  totalChipText: { color: '#1e40af', fontSize: 12 },
  searchbar: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', elevation: 0 },
  searchInput: { fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  loadingRow: { paddingVertical: 32, alignItems: 'center' },
  sep: { height: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  cardContent: { paddingVertical: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardInfo: { flex: 1 },
  headName: { fontWeight: '700', color: '#0d2137' },
  familyCode: { color: '#64748b', marginTop: 2, fontFamily: 'monospace' },
  meta: { color: '#475569', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  editBtn: { margin: 0 },
  badges: { gap: 4 },
  memberChip: { backgroundColor: '#e0f2fe' },
  policyChip: { backgroundColor: '#dcfce7' },
  chipText: { fontSize: 11 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1a3c5e',
  },
  dialog: { borderRadius: 16, marginHorizontal: 8 },
  dialogScroll: { maxHeight: 500, paddingHorizontal: 0 },
  form: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  input: { backgroundColor: '#fff' },
  submitBtn: { height: 44, paddingHorizontal: 8 },
});
