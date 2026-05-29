import * as yup from 'yup';

export const activitySchema = yup.object({
  clientId: yup.number().required('Client is required'),
  activityType: yup
    .string()
    .oneOf(['CALL', 'MEETING', 'DEMO', 'EMAIL', 'PROPOSAL', 'MEDICAL', 'REMINDER'] as const)
    .required('Activity type is required'),
  activityDate: yup.string().required('Activity date is required'),
  activityTime: yup.string().optional(),
  details: yup.string().optional(),
  reminderDate: yup.string().optional(),
  reminderTime: yup.string().optional(),
  status: yup.string().oneOf(['PENDING', 'DONE', 'CANCELLED'] as const).optional(),
});

export type ActivityFormData = yup.InferType<typeof activitySchema>;
