import { Slider, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { useAppDispatch, useAppSelector } from '../../lib/source';
import { updateSetting } from '../../lib/source/actions';
import { DefaultSetting, setSetting } from '../../lib/store';
import { ICardSize, IState } from '../../type';

const StyledFooter = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  height: 28,
  backgroundColor: theme.palette.primary.main,
  paddingLeft: 5,
  paddingRight: 20,
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  width: 300,
  color: theme.palette.action.selected,
}));

interface IFooter {
  selected: string;
}

function Footer({ selected }: IFooter): JSX.Element {
  const dispatch = useAppDispatch();
  const setting = useAppSelector((state: IState) => state.setting);

  function computeValue(): number {
    const ratio = setting.cardSize.width / DefaultSetting.cardSize.width;
    return Math.round(ratio * 10) * 10;
  }

  async function onChange(_event: any, value: number | number[]) {
    const ratio = (value as number) / 100;
    const newSize: ICardSize = {
      width: DefaultSetting.cardSize.width * ratio,
      height: DefaultSetting.cardSize.height * ratio,
    };
    try {
      updateSetting(dispatch, setSetting({ ...setting, cardSize: newSize }));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <StyledFooter
      sx={{
        width: setting.showSidePanelName
          ? 'calc(100% - 240px)'
          : 'calc(100% - 60px)',
        left: setting.showSidePanelName ? 240 : 60,
      }}
    >
      <Tooltip title={selected}>
        <Typography
          variant="body1"
          component="span"
          display={'inline'}
          noWrap
          style={{
            color: '#6f7a83',
            cursor: 'default',
            width: 'calc(100% - 320px)',
          }}
        >
          {selected}
        </Typography>
      </Tooltip>
      <StyledSlider
        aria-label="image-size"
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        size={'small'}
        defaultValue={100}
        value={computeValue()}
        step={10}
        marks
        min={50}
        max={150}
        onChangeCommitted={onChange}
      />
    </StyledFooter>
  );
}

export default Footer;
