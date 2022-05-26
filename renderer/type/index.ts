export const MOVIE = 'movie';
export const TV_SERIES = 'tvshow';
export const EPISODE = 'episodedetails';
export const COMIC = 'comic';

export const DEFAULT = 'Directory';
export const TITLE_ASC = 'Name(A-Z)';
export const TITLE_DSC = 'Name(Z-A)';
export const YEAR_ASC = 'Oldest';
export const YEAR_DSC = 'Newest';

export type SORT =
  | typeof DEFAULT
  | typeof TITLE_ASC
  | typeof TITLE_DSC
  | typeof YEAR_ASC
  | typeof YEAR_DSC;

interface ITags {
  tags: string[];
  genres: string[];
  actors: string[];
  studios: string[];
}

export interface IFolderInfo extends ITags {
  sort: SORT;
  data: IMediaData[];
}

export interface IComicData extends ITags {
  type: typeof COMIC;
  file: string;
  title: string;
  poster: string;
}

export interface IMovieData extends ITags {
  type: typeof MOVIE;
  file: string;
  title: string;
  year: string;
  poster: string;
}

export interface ITVShowData extends ITags {
  type: typeof TV_SERIES;
  title: string;
  poster: string;
  seasons: ISeason[];
}

export interface ISeason {
  season: number;
  poster: string;
  episodes: IEpisode[];
}

export interface IEpisode {
  name: string;
  file: string;
  season: number;
  episode: number;
}

export type IMediaData = IMovieData | ITVShowData | IComicData;

export interface ICardSize {
  width: number;
  height: number;
}

export interface ISetting {
  showSidePanelName: boolean;
  skippingDirectory: string[];
  cardSize: ICardSize;
}

export interface IError {
  open: boolean;
  msg: string;
}

export const SEARCH = 'SEARCH';
export const UPDATE_FOLDER = 'FOLDER';
export const UPDATE_SETTING = 'SETTING';
export const NOTIFICATION = 'NOTIFICATION';

export interface IFolder {
  name: string;
  dir: string;
}

export interface IState {
  search: string;
  setting: ISetting;
  folders: IFolder[];
  error: IError;
}

export interface IFilterPros {
  tags: string[];
  genres: string[];
  actors: string[];
  studios: string[];
}

export const TAG = 1;
export const GENRE = 2;
export const ACTOR = 3;
export const STUDIO = 4;

export type FILTER = typeof TAG | typeof GENRE | typeof ACTOR | typeof STUDIO;

export interface IKeyFiles {
  nfo?: string;
  poster: string[];
  media: string[];
  dir: string[];
  cbr: string[];
}

export interface ICacheImage {
  src: string;
  data: string | Buffer;
}
