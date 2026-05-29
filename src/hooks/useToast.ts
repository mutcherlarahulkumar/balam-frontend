import { useSnackbar, VariantType } from 'notistack';

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (msg: string) => enqueueSnackbar(msg, { variant: 'success' }),
    error: (msg: string) => enqueueSnackbar(msg, { variant: 'error' }),
    warning: (msg: string) => enqueueSnackbar(msg, { variant: 'warning' }),
    info: (msg: string) => enqueueSnackbar(msg, { variant: 'info' }),
  };
}
