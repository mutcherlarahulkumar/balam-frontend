import * as yup from 'yup';

const MOBILE_RE = /^[6-9]\d{9}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .matches(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  agentCode: yup
    .string()
    .required('Agent code is required')
    .matches(/^[A-Z]{2}\d{6}$/, 'Agent code must be 2 uppercase letters + 6 digits (e.g. AG001234)'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(PASSWORD_RE, 'Must contain uppercase, lowercase, and a number'),
  branch: yup
    .string()
    .required('Branch code is required')
    .min(3, 'Enter a valid branch code'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(MOBILE_RE, 'Enter a valid 10-digit Indian mobile number starting with 6–9'),
  licenceNo: yup
    .string()
    .required('Licence number is required')
    .min(5, 'Enter a valid LIC licence number'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(PASSWORD_RE, 'Must contain uppercase, lowercase, and a number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;
/** @deprecated use LoginFormValues */
export type LoginFormData = LoginFormValues;
/** @deprecated use RegisterFormValues */
export type RegisterFormData = RegisterFormValues;
/** @deprecated use ChangePasswordFormValues */
export type ChangePasswordFormData = ChangePasswordFormValues;
