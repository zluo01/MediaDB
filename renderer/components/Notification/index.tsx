import { Alert, AlertTitle, Snackbar } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../lib/source';
import { notify } from '../../lib/source/actions';
import { IState } from '../../type';

function Error(): JSX.Element {
  const dispatch = useAppDispatch();
  const { open, msg } = useAppSelector((state: IState) => state.error);

  async function handleClose() {
    notify(dispatch, false, '');
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        <AlertTitle>Error</AlertTitle>
        {msg}
      </Alert>
    </Snackbar>
  );
}

export default Error;
