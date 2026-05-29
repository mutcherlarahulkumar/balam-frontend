import * as yup from 'yup';

export const commissionSchema = yup.object({
  policyNo: yup.number().required('Policy number is required'),
  billDate: yup.string().required('Bill date is required'),
  firstComm: yup.number().min(0).optional(),
  secondComm: yup.number().min(0).optional(),
  thirdComm: yup.number().min(0).optional(),
  bonusComm: yup.number().min(0).optional(),
  singleComm: yup.number().min(0).optional(),
  payDate: yup.string().optional(),
});

export type CommissionFormData = yup.InferType<typeof commissionSchema>;
