import * as yup from 'yup';

export const policySchema = yup.object({
  policyNo: yup
    .number()
    .typeError('Policy number must be a number')
    .required('Policy number is required')
    .integer('Policy number must be a whole number')
    .positive('Policy number must be positive'),
  familyCode: yup.string().required('Family code is required').max(15),
  persCode: yup.string().required('Person code is required').max(10),
  planNo: yup.string().required('Plan is required'),
  issueDate: yup
    .string()
    .required('Issue date is required')
    .test('not-future', 'Issue date cannot be in the future', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    }),
  matDate: yup
    .string()
    .required('Maturity date is required')
    .test('after-issue', 'Maturity date must be after issue date', function (v) {
      const issue = this.parent.issueDate;
      if (!v || !issue) return true;
      return new Date(v) > new Date(issue);
    }),
  term: yup
    .number()
    .typeError('Term must be a number')
    .required('Term is required')
    .integer('Term must be a whole number')
    .min(1, 'Minimum term is 1 year'),
  ppt: yup
    .number()
    .typeError('PPT must be a number')
    .required('PPT is required')
    .integer('PPT must be a whole number')
    .min(1, 'PPT must be at least 1 year')
    .test('ppt-lte-term', 'PPT cannot exceed the policy term', function (v) {
      if (!v) return true;
      return v <= (this.parent.term ?? Infinity);
    }),
  sumAssured: yup
    .number()
    .typeError('Sum assured must be a number')
    .required('Sum assured is required')
    .positive('Sum assured must be greater than 0'),
  premium: yup
    .number()
    .typeError('Premium must be a number')
    .required('Premium is required')
    .positive('Premium must be greater than 0'),
  paymentMode: yup
    .string()
    .oneOf(['Y', 'H', 'Q', 'M', 'S'] as const, 'Select a valid payment mode')
    .required('Payment mode is required'),
  nextPremium: yup.string().required('Next premium date is required'),
  nominee: yup
    .string()
    .required('Nominee name is required')
    .min(2, 'Nominee name must be at least 2 characters')
    .max(80),
  relation: yup.string().required('Relation is required').min(2).max(20),
  branch: yup.string().optional().max(15),
  neft: yup.string().oneOf(['YES', 'NO'] as const).optional(),
  dab: yup.number().typeError('DAB must be a number').optional().min(0),
  termRider: yup.number().typeError('Term Rider must be a number').optional().min(0),
});

export type PolicyFormValues = yup.InferType<typeof policySchema>;
/** @deprecated use PolicyFormValues */
export type PolicyFormData = PolicyFormValues;
