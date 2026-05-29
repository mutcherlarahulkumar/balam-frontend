import * as yup from 'yup';

export const loanSchema = yup.object({
  policyNo: yup.number().required('Policy number is required'),
  loanDate: yup.string().required('Loan date is required'),
  loanAmount: yup
    .number()
    .required('Loan amount is required')
    .min(1, 'Loan amount must be positive'),
  interestDueDate: yup.string().required('Interest due date is required'),
  loanInterest: yup.number().min(0).optional(),
});

export type LoanFormData = yup.InferType<typeof loanSchema>;
