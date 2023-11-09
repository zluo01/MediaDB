export const MOVIE = 'movie';
export const TV_SERIES = 'tvshow';
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

export interface IFolderData extends IFolder, IFolderInfo {}

// export interface IComicData extends ITags {
//   type: typeof COMIC;
//   file: string;
//   title: string;
//   posters: Map<string, string>;
// }

export interface IMovieData extends ITags {
  type: typeof MOVIE;
  file: string;
  title: string;
  year: string;
  posters: Record<string, string>;
  relativePath: string;
}

export interface ITVShowData extends ITags {
  type: typeof TV_SERIES;
  title: string;
  posters: Record<string, string>;
  seasons: Record<string, IEpisode[]>;
  relativePath: string;
}

export interface IEpisode {
  title: string;
  file: string;
  season: number;
  episode: number;
  relativePath: string;
}

export type IMediaData = IMovieData | ITVShowData;

export interface ISetting {
  showSidePanel: boolean;
  skipFolders: string[];
}

export interface IFolder {
  name: string;
  path: string;
  position: number;
  appDir?: string;
}

export interface IControlState {
  search: string;
}

export interface IFilterState {
  tags: string[];
  genres: string[];
  actors: string[];
  studios: string[];
}

export interface IFilterProps {
  tag: FILTER;
  name: string;
}

export const TAG = 'Tags';
export const GENRE = 'Genres';
export const ACTOR = 'Actors';
export const STUDIO = 'Studios';

export type FILTER = typeof TAG | typeof GENRE | typeof ACTOR | typeof STUDIO;

export enum CoverType {
  POSTER,
  COVER,
}

export interface IImageLoaderPops {
  thumbnail: string;
  cover: string;
  alt: string;
  width: number;
  height: number;
  t: CoverType;
}
