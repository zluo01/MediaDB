import { notify } from '@/lib/os';
import { useChangeCardSizeTrigger } from '@/lib/queries';
import { DefaultSetting } from '@/lib/storage';
import { ISetting } from '@/type';
import { Slider, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactElement } from 'react';

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
  setting: ISetting;
  selected: string;
}

function Footer({ setting, selected }: IFooter): ReactElement {
  const { trigger } = useChangeCardSizeTrigger();

  function computeValue(): number {
    const ratio = setting.cardSize.width / DefaultSetting.cardSize.width;
    return Math.round(ratio * 10) * 10;
  }

  async function onChange(_event: any, value: number | number[]) {
    const ratio = (value as number) / 100;
    try {
      await trigger({
        width: Math.round(DefaultSetting.cardSize.width * ratio),
        height: Math.round(DefaultSetting.cardSize.height * ratio),
      });
    } catch (e) {
      await notify(`Fail to change card size: ${e}`);
    }
  }

  return (
    <StyledFooter
      sx={{
        width: setting.showSidePanel
          ? 'calc(100% - 240px)'
          : 'calc(100% - 60px)',
        left: setting.showSidePanel ? 240 : 60,
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
