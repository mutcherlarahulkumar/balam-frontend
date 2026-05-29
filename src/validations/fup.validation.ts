import * as yup from 'yup';

export const fupUpdateSchema = yup.object({
  policyNo: yup.number().required('Policy number is required'),
  oldFup: yup.string().required('Current FUP date is required'),
  newFup: yup.string().required('New FUP date is required'),
  reason: yup.string().optional(),
});

export type FUPUpdateFormData = yup.InferType<typeof fupUpdateSchema>;
