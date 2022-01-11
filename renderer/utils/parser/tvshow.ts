import parser from 'fast-xml-parser';
import fs from 'fs';
import _ from 'lodash';
import Path from 'path';

import {
  EPISODE,
  ICacheImage,
  IEpisode,
  IKeyFiles,
  ISeason,
  ITVShowData,
  TV_SERIES,
} from '../../type';

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

function getPoster(posters: { [k: string]: string }, season: number): string {
  const expectedPoster = `season${_.padStart(
    season === 0 ? 'specials' : season.toString(),
    2,
    '0'
  )}-poster`;
  return posters[expectedPoster] || posters.poster;
}

async function parseEpisodeInfo(path: string): Promise<IEpisode[]> {
  const files = await fs.promises.readdir(path, { withFileTypes: true });
  const nfoFiles = _.filter(
    files,
    o => !o.isDirectory() && o.name.endsWith('nfo')
  );

  const episodeInfo: IEpisode[] = [];
  for (let i = 0; i < nfoFiles.length; i++) {
    const data = await fs.promises.readFile(Path.join(path, nfoFiles[i].name));
    const info = parser.parse(data.toString());
    if (info.episodedetails) {
      const episodeDetails = info[EPISODE];
      episodeInfo.push({
        name: episodeDetails.title,
        file: Path.join(path, episodeDetails.original_filename),
        season: episodeDetails.season,
        episode: episodeDetails.episode,
      });
    }
  }
  return episodeInfo;
}

export async function parseTVShowNFO(
  path: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data: any,
  files: IKeyFiles,
  collector: (obj: ICacheImage) => void
): Promise<ITVShowData> {
  const d = data[TV_SERIES];
  const actors = Array.isArray(d.actor) ? d.actor : [d.actor];

  const posters = files.poster.reduce((map, poster) => {
    map[poster.replace('.' + getExtension(poster), '')] = poster;
    return map;
  }, {} as { [k: string]: string });

  const shows: ISeason[] = [];
  for (let i = 0; i < files.dir.length; i++) {
    const currPath = Path.join(path, files.dir[i]);
    const episodes = await parseEpisodeInfo(currPath);
    if (!episodes.length) {
      continue;
    }
    const season = episodes[0].season;

    const poster = Path.join(path, getPoster(posters, season));
    collector({
      src: poster,
      data: poster,
    });
    shows.push({
      season: season,
      poster: poster,
      episodes: episodes,
    });
  }

  return {
    seasons: shows.sort((a, b) => a.season - b.season),
    actor: actors.filter((o: any) => o).map((a: { name: string }) => a.name),
    genre: Array.isArray(d.genre) ? d.genre : [d.genre],
    tag: Array.isArray(d.tag) ? d.tag : [d.tag],
    title: d.title,
    type: TV_SERIES,
    poster: Path.join(path, posters.poster),
    studio: Array.isArray(d.studio) ? d.studio : [d.studio],
  };
}
