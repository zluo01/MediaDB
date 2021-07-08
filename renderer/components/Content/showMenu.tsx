import { AppBar, Box, Button, Tab, Tabs } from '@material-ui/core';
import { styled, useTheme } from '@material-ui/core/styles';
import dynamic from 'next/dynamic';
import React from 'react';

import { ITVShowData } from '../../type';
import { openFile } from '../../utils/electron';

const Section = styled('div')(({ theme }) => ({
  flexGrow: 1,
  width: 720,
  boxShadow: theme.shadows[3],
}));

const EpisodeButton = styled(Button)(({ theme }) => ({
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
}));

const SeasonPanel = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: 'inherit',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <SeasonPanel
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </SeasonPanel>
  );
}

function a11yProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const Image = dynamic(() => import('../ImageLoader'), { ssr: false });

interface ITVShowCardMenuProps {
  data: ITVShowData;
}

export default function TVShowCardMenu({
  data,
}: ITVShowCardMenuProps): JSX.Element {
  const theme = useTheme();
  const chunkSize = 5;
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

  // Todo fix layout by using grid
  return (
    <Section>
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
              sx={{
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
                  size={{ width: 220, height: 330 }}
                />
              </Box>
              <Box
                display={'flex'}
                flexDirection={'column'}
                flexWrap={'nowrap'}
                maxHeight={520}
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
                        <EpisodeButton
                          key={i}
                          variant="outlined"
                          onClick={() => openFile(v)}
                        >
                          {idx * chunkSize + i + 1}
                        </EpisodeButton>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </TabPanel>
        );
      })}
    </Section>
  );
}
