import {
  Button,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  Popper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const Divider = styled('hr')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  borderColor: theme.palette.secondary.main,
  color: theme.palette.secondary.main,
  flexGrow: 1,
  margin: theme.spacing(1),
}));

export const RefreshButton = styled(Button)(({ theme }) => ({
  width: 125,
  color: theme.palette.action.selected,

  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.action.hover,
  },
}));

export const ActionButton = styled(RefreshButton)(({ theme }) => ({
  '& > *': {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

export const Loading = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.action.selected,
  position: 'fixed',
  right: '50%',
  top: '50%',
}));

export const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.action.selected,
}));

export const MediaCard = styled(ImageListItem)(() => ({
  justifyContent: 'center',
  alignItems: 'center',
}));

export const CardGrid = styled(ImageList)(() => ({
  paddingBottom: 28,
}));

export const CardInfo = styled(ImageListItemBar)(() => ({
  height: 42,
}));
