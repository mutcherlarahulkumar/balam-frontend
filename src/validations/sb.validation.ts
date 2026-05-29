import * as yup from 'yup';

export const sbSchema = yup.object({
  policyNo: yup.number().required('Policy number is required'),
  sbDueDate: yup.string().required('SB due date is required'),
  sbAmount: yup
    .number()
    .required('SB amount is required')
    .min(1, 'Amount must be positive'),
  instalmentNo: yup
    .number()
    .required('Instalment number is required')
    .min(1, 'Instalment number must be at least 1'),
});

export const sbMarkPaidSchema = yup.object({
  paidDate: yup.string().required('Paid date is required'),
  chequeNo: yup.string().optional(),
});

export type SBFormData = yup.InferType<typeof sbSchema>;
export type SBMarkPaidFormData = yup.InferType<typeof sbMarkPaidSchema>;
