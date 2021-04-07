import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { ITVShowData } from '../../type';
import { theme } from '../../lib/theme';
import Button from '@material-ui/core/Button';
import { openFile } from '../../utils/electron';
import dynamic from 'next/dynamic';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const classes = useStyles();

  const { children, value, index, ...other } = props;

  return (
    <div
      className={classes.panel}
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: 720,
    boxShadow: theme.shadows[3],
  },
  panel: {
    backgroundColor: theme.palette.background.default,
    width: 'inherit',
    height: 320,
  },
  box: {
    borderColor: theme.palette.action.selected,
    color: theme.palette.action.selected,
    marginRight: 5,

    '& > *': {
      margin: theme.spacing(1),
    },

    '&:hover': {
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.action.hover,
    },
  },
}));

const Image = dynamic(() => import('../ImageLoader'), { ssr: false });

interface ITVShowCardMenuProps {
  data: ITVShowData;
}

export default function TVShowCardMenu({
  data,
}: ITVShowCardMenuProps): JSX.Element {
  const chunkSize = 5;
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.ChangeEvent<any>, newValue: number) => {
    setValue(newValue);
  };

  function splitEpisodes(ep: string[]): string[][] {
    if (ep.length < chunkSize) {
      return [ep];
    }
    const result: string[][] = [];
    for (let i = 0; i < ep.length; i += chunkSize) {
      result.push(ep.slice(i, i + chunkSize));
    }
    return result;
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {data.shows.map((show, index) => (
            <Tab
              key={index}
              style={{
                color:
                  value !== index
                    ? theme.palette.action.selected
                    : theme.palette.action.hover,
                backgroundColor:
                  value !== index ? 'inherit' : theme.palette.action.selected,
              }}
              label={show.name}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </AppBar>
      {data.shows.map((show, index) => {
        const chunks = splitEpisodes(show.files);
        return (
          <TabPanel key={index} value={value} index={index}>
            <Box
              display={'flex'}
              flexDirection={'row'}
              flexWrap={'nowrap'}
              justifyContent={'space-around'}
            >
              <Box display={'flex'} width={'38.2%'} justifyContent={'center'}>
                <Image
                  dir={show.poster}
                  title={data.title}
                  size={{ width: 180, height: 270 }}
                />
              </Box>
              <Box
                display={'flex'}
                flexDirection={'column'}
                flexWrap={'wrap'}
                overflow={'auto'}
                width={'61.8%'}
              >
                {chunks.map((chunk, idx) => (
                  <Box
                    key={idx}
                    display={'flex'}
                    flexDirection={'row'}
                    flexWrap={'nowrap'}
                  >
                    {chunk.map((v, i) => {
                      return (
                        <Button
                          key={i}
                          variant="outlined"
                          className={classes.box}
                          onClick={() => openFile(v)}
                        >
                          {idx * chunkSize + i + 1}
                        </Button>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </TabPanel>
        );
      })}
    </div>
  );
}
