import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Dialog,
  Portal,
  Button,
  TextInput,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { useFormik } from 'formik';
import Screen from '@/components/common/Screen';
import LoadingState from '@/components/common/LoadingState';
import { useLeads, useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import { useToast } from '@/hooks/useToast';
import { leadSchema, LeadFormValues } from '@/validations/lead.validation';
import { Lead } from '@/types/lead.types';

const INITIAL_VALUES: LeadFormValues = {
  name: '',
  mobile: '',
  address: '',
  searchTerm: '',
};

type DialogMode = 'add' | 'edit';

export default function LeadsScreen() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>('add');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { data: leads, isLoading } = useLeads();
  const createLead = useCreateLead();
  const updateLeadMutation = useUpdateLead(editingLead?.id ?? 0);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l: Lead) =>
        l.name.toLowerCase().includes(q) ||
        l.mobile.includes(q) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.searchTerm && l.searchTerm.toLowerCase().includes(q)),
    );
  }, [leads, search]);

  const formik = useFormik<LeadFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: leadSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        if (dialogMode === 'add') {
          await createLead.mutateAsync({
            name: values.name,
            mobile: values.mobile,
            address: values.address || undefined,
            searchTerm: values.searchTerm || undefined,
          });
          toast.success('Lead added');
        } else if (editingLead) {
          await updateLeadMutation.mutateAsync({
            name: values.name,
            mobile: values.mobile,
            address: values.address || undefined,
            searchTerm: values.searchTerm || undefined,
          });
          toast.success('Lead updated');
        }
        closeDialog();
        helpers.resetForm();
      } catch {
        toast.error(dialogMode === 'add' ? 'Failed to add lead' : 'Failed to update lead');
      }
    },
  });

  function openAddDialog() {
    setDialogMode('add');
    setEditingLead(null);
    formik.resetForm({ values: INITIAL_VALUES });
    setDialogVisible(true);
  }

  function openEditDialog(lead: Lead) {
    setDialogMode('edit');
    setEditingLead(lead);
    formik.resetForm({
      values: {
        name: lead.name,
        mobile: lead.mobile,
        address: lead.address ?? '',
        searchTerm: lead.searchTerm ?? '',
      },
    });
    setDialogVisible(true);
  }

  function closeDialog() {
    setDialogVisible(false);
    setEditingLead(null);
    formik.resetForm();
  }

  const isMutating = createLead.isPending || updateLeadMutation.isPending;

  if (isLoading) return <LoadingState />;

  return (
    <>
      <Screen>
        <Text variant="headlineSmall" style={styles.heading}>Leads</Text>

        <Searchbar
          placeholder="Search by name, mobile..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        {!filteredLeads.length ? (
          <Text style={styles.empty}>
            {search ? 'No leads match your search.' : 'No leads yet. Add one!'}
          </Text>
        ) : (
          filteredLeads.map((lead: Lead) => (
            <Card key={lead.id} style={styles.card} mode="outlined">
              <Card.Content>
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text variant="titleMedium" style={styles.leadName}>{lead.name}</Text>
                    <Text variant="bodyMedium" style={styles.mobile}>{lead.mobile}</Text>
                    {!!lead.address && (
                      <Text variant="bodySmall" style={styles.secondary}>{lead.address}</Text>
                    )}
                    {!!lead.searchTerm && (
                      <Text variant="bodySmall" style={styles.searchTermText}>
                        Tag: {lead.searchTerm}
                      </Text>
                    )}
                  </View>
                  <IconButton
                    icon="pencil-outline"
                    size={20}
                    iconColor="#1a3c5e"
                    onPress={() => openEditDialog(lead)}
                  />
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </Screen>

      <FAB icon="plus" style={styles.fab} onPress={openAddDialog} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>{dialogMode === 'add' ? 'Add Lead' : 'Edit Lead'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name *"
              mode="outlined"
              value={formik.values.name}
              onChangeText={(v) => formik.setFieldValue('name', v)}
              onBlur={() => formik.setFieldTouched('name')}
              error={formik.touched.name && !!formik.errors.name}
              style={styles.input}
            />
            {formik.touched.name && formik.errors.name && (
              <Text style={styles.errorText}>{formik.errors.name}</Text>
            )}

            <TextInput
              label="Mobile *"
              mode="outlined"
              keyboardType="phone-pad"
              value={formik.values.mobile}
              onChangeText={(v) => formik.setFieldValue('mobile', v)}
              onBlur={() => formik.setFieldTouched('mobile')}
              error={formik.touched.mobile && !!formik.errors.mobile}
              style={styles.input}
            />
            {formik.touched.mobile && formik.errors.mobile && (
              <Text style={styles.errorText}>{formik.errors.mobile}</Text>
            )}

            <TextInput
              label="Address (optional)"
              mode="outlined"
              value={formik.values.address ?? ''}
              onChangeText={(v) => formik.setFieldValue('address', v)}
              onBlur={() => formik.setFieldTouched('address')}
              error={formik.touched.address && !!formik.errors.address}
              style={styles.input}
            />
            {formik.touched.address && formik.errors.address && (
              <Text style={styles.errorText}>{formik.errors.address}</Text>
            )}

            <TextInput
              label="Tag / Search Term (optional)"
              mode="outlined"
              value={formik.values.searchTerm ?? ''}
              onChangeText={(v) => formik.setFieldValue('searchTerm', v)}
              onBlur={() => formik.setFieldTouched('searchTerm')}
              error={formik.touched.searchTerm && !!formik.errors.searchTerm}
              style={styles.input}
            />
            {formik.touched.searchTerm && formik.errors.searchTerm && (
              <Text style={styles.errorText}>{formik.errors.searchTerm}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => formik.handleSubmit()}
              loading={isMutating}
              disabled={isMutating}
            >
              {dialogMode === 'add' ? 'Add Lead' : 'Save Changes'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 12 },
  searchbar: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 10 },
  searchInput: { fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  flex1: { flex: 1 },
  leadName: { fontWeight: '700', color: '#1a3c5e' },
  mobile: { color: '#0369a1', marginTop: 2 },
  secondary: { color: '#64748b', marginTop: 2 },
  searchTermText: { color: '#7c3aed', marginTop: 2 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#1a3c5e' },
  input: { marginBottom: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 4, marginTop: -4 },
});
