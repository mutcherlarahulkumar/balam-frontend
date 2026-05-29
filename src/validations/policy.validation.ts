import * as yup from 'yup';

export const policySchema = yup.object({
  policyNo: yup
    .number()
    .required('Policy number is required')
    .positive('Policy number must be positive')
    .integer('Policy number must be an integer'),
  familyCode: yup.string().required('Family code is required'),
  persCode: yup.string().required('Person code is required'),
  planNo: yup.string().required('Plan is required'),
  issueDate: yup.string().required('Issue date is required'),
  matDate: yup.string().required('Maturity date is required'),
  term: yup
    .number()
    .required('Term is required')
    .min(1, 'Term must be at least 1 year'),
  ppt: yup
    .number()
    .required('PPT is required')
    .min(1, 'PPT must be at least 1 year'),
  sumAssured: yup
    .number()
    .required('Sum assured is required')
    .min(1, 'Sum assured must be positive'),
  premium: yup
    .number()
    .required('Premium is required')
    .min(1, 'Premium must be positive'),
  paymentMode: yup
    .string()
    .oneOf(['Y', 'H', 'Q', 'M', 'S'] as const)
    .required('Payment mode is required'),
  nextPremium: yup.string().required('Next premium date is required'),
  nominee: yup.string().required('Nominee name is required'),
  relation: yup.string().required('Relation is required'),
  branch: yup.string().optional(),
  neft: yup.string().oneOf(['YES', 'NO'] as const).optional(),
  dab: yup.number().optional(),
  termRider: yup.number().optional(),
});

export type PolicyFormData = yup.InferType<typeof policySchema>;
