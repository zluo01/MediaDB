import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { notify } from '../../lib/store';
import { IReduxState } from '../../type';

function Error(): JSX.Element {
  const dispatch = useDispatch();
  const { open, msg } = useSelector((state: IReduxState) => state.error);

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
