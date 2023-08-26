import Image from '@/components/ImageLoader';
import { openFile } from '@/lib/os';
import { IEpisode, IFolder, ITVShowData } from '@/type';
import { AppBar, Box, Button, Tab, Tabs, Tooltip } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import path from 'path';
import React, { ReactElement } from 'react';

const Section = styled('div')(() => ({
  height: '38.2vh',
  minHeight: 420,
}));

const EpisodeButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.action.selected,
  color: theme.palette.action.selected,
  width: 50,
  height: 42,
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),

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
  height: 'calc(100% - 48px)',
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
      {value === index && (
        <Box p={3} sx={{ background: 'inherit' }}>
          {children}
        </Box>
      )}
    </SeasonPanel>
  );
}

function a11yProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

interface ITVShowCardMenuProps {
  folder: IFolder;
  data: ITVShowData;
}

export default function TVShowCardMenu({
  folder,
  data,
}: ITVShowCardMenuProps): ReactElement {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.ChangeEvent<any>, newValue: number) => {
    setValue(newValue);
  };

  async function openEpisodeFile(media: IEpisode) {
    const filePath = path.join(folder.path, media.relativePath, media.file);
    await openFile(filePath);
  }

  const season_keys = Object.keys(data.seasons).sort();
  return (
    <Section>
      <AppBar position="sticky">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {season_keys.map((key, index) => (
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
              label={`Season ${key == '00' ? 'SP' : key}`}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </AppBar>
      {season_keys.map((key, index) => (
        <TabPanel key={index} value={value} index={index}>
          <Box
            display={'flex'}
            flexDirection={'row'}
            flexWrap={'nowrap'}
            justifyContent={'space-around'}
          >
            <Box display={'flex'} width={'38.2%'} justifyContent={'center'}>
              <Image
                folder={folder}
                src={path.join(
                  data.relativePath,
                  data.posters[key] || data.posters['main'],
                )}
                alt={data.title}
                width={220}
                height={320}
              />
            </Box>
            <Box display={'flex'} width={'61.8%'}>
              <Box flexDirection={'row'} flexWrap={'wrap'} overflow={'auto'}>
                {data.seasons[key].map((o, i) => (
                  <Tooltip key={i} title={o.title}>
                    <EpisodeButton
                      variant="outlined"
                      onClick={() => openEpisodeFile(o)}
                    >
                      {o.episode}
                    </EpisodeButton>
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </Box>
        </TabPanel>
      ))}
    </Section>
  );
}
