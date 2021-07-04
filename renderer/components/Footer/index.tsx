import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { updateSetting } from '../../lib/store';
import {
  ICardSize,
  IReduxState,
  ISetting,
  ISettingAction,
  TProps,
} from '../../type';
import { DefaultSetting, setSetting } from '../../utils/store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'fixed',
      width: (props: TProps) =>
        props.show ? 'calc(100% - 240px)' : 'calc(100% - 60px)',
      bottom: 0,
      left: (props: TProps) => (props.show ? 240 : 60),
      height: 28,
      backgroundColor: theme.palette.primary.main,
      paddingLeft: 5,
      paddingRight: 20,
      display: 'flex',
      flexFlow: 'row nowrap',
      justifyContent: 'space-between',
    },
    slider: {
      width: 300,
      color: theme.palette.action.selected,
    },
    text: {
      color: '#6f7a83',
      cursor: 'default',
      width: 'calc(100% - 320px)',
    },
  })
);

interface IBar {
  selected: string;
  setting: ISetting;
  dispatch: Dispatch<ISettingAction>;
}

function Footer({ selected, setting, dispatch }: IBar): JSX.Element {
  const classes = useStyles({ show: setting.showSidePanelName });

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
      const newSetting = await setSetting({ ...setting, cardSize: newSize });
      updateSetting(dispatch, newSetting);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className={classes.root}>
      <Tooltip title={selected}>
        <Typography
          className={classes.text}
          variant="body1"
          component="span"
          display={'inline'}
          noWrap
        >
          {selected}
        </Typography>
      </Tooltip>
      <Slider
        className={classes.slider}
        defaultValue={100}
        value={computeValue()}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        step={10}
        marks
        min={50}
        max={150}
        onChangeCommitted={onChange}
      />
    </div>
  );
}

const mapStateToProps = (state: IReduxState) => ({
  setting: state.setting,
});

export default connect(mapStateToProps)(Footer);
