import * as yup from 'yup';

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .required('Email or Agent Code is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: yup.string().required('Email is required').email('Invalid email address'),
  agentCode: yup.string().required('Agent code is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  branch: yup.string().required('Branch is required'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .min(10, 'Mobile must be at least 10 digits')
    .max(15, 'Mobile must be at most 15 digits'),
  licenceNo: yup.string().required('Licence number is required'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
