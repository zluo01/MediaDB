import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { updateSetting } from '../../lib/store';
import { ICardSize, IReduxState, ISetting, ISettingAction } from '../../type';
import { DefaultSetting, setSetting } from '../../utils/store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'fixed',
      width: '100%',
      bottom: 0,
      right: 0,
      height: 28,
      backgroundColor: theme.palette.primary.main,
    },
    slider: {
      width: 300,
      marginRight: 25,
      float: 'right',
      color: theme.palette.action.selected,
    },
    text: {
      marginLeft: 72,
      color: '#6f7a83',
    },
  })
);

interface IBar {
  selected: string;
  setting: ISetting;
  dispatch: Dispatch<ISettingAction>;
}

function BottomInfoBar({ selected, setting, dispatch }: IBar): JSX.Element {
  const classes = useStyles();

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
      <Typography
        className={classes.text}
        variant="body1"
        component="span"
        display={'inline'}
      >
        {selected}
      </Typography>
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

export default connect(mapStateToProps)(BottomInfoBar);
