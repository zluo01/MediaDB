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

export const TAG = 'tags';
export const GENRE = 'genres';
export const ACTOR = 'actors';
export const STUDIO = 'studios';

export type FILTER = typeof TAG | typeof GENRE | typeof ACTOR | typeof STUDIO;

export interface ITags {
  [TAG]: string[];
  [GENRE]: string[];
  [ACTOR]: string[];
  [STUDIO]: string[];
}

export const EMPTY_FILTERS: ITags = {
  [TAG]: [],
  [GENRE]: [],
  [ACTOR]: [],
  [STUDIO]: [],
};

export interface IFilterAction {
  tag: FILTER;
  name: string;
}

export interface IFolderInfo extends ITags {
  sort: SORT;
  data: IMediaData[];
}

export interface IFolderData extends IFolder, IFolderInfo {
  status: FolderStatus;
}

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

export interface IComicData extends ITags {
  type: typeof COMIC;
  file: string;
  title: string;
  posters: Record<string, string>;
  relativePath: string;
}

export type IMediaData = IMovieData | ITVShowData | IComicData;

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

export enum FolderStatus {
  NONE,
  LOADING,
  ERROR,
}

export enum ModalType {
  NONE,
  DIRECTORY,
  EDIT_FOLDER,
  SKIP_FOLDER,
}

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
