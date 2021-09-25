import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const ModalTitle = styled(DialogTitle)(({ theme }) => ({
  textColor: theme.palette.text.primary,
  backgroundColor: theme.palette.primary.main,
}));

export const ModalContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
}));

export const ActionButtonGroups = styled(DialogActions)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  paddingRight: 24,
}));

export const DialogButton = styled(Button)(({ theme }) => ({
  width: 100,
  color: theme.palette.action.selected,

  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.action.hover,
  },
}));
