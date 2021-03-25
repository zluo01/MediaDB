export const MOVIE = 'movie';
export const TV_SERIES = 'tvshow';

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

export interface IFolderInfo {
  sort: SORT;
  tags: string[];
  genres: string[];
  actors: string[];
  data: IMediaData[];
}

export interface IMovieData {
  type: typeof MOVIE;
  file: string;
  title: string;
  year: string;
  poster: string;
  fanart: string;
  genre: string[];
  tag: string[];
  actors: string[];
}

export interface ITVShowData {
  type: typeof TV_SERIES;
  title: string;
  genre: string[];
  tag: string[];
  actors: string[];
}

export type IMediaData = IMovieData | ITVShowData;

export interface ICardSize {
  width: number;
  height: number;
}

export interface ISetting {
  showSidePanelName: boolean;
  skippingDirectory: string[];
  cardSize: ICardSize;
}

export const CHANGE_FOLDER = 'CHANGE_FOLDER';
export const UPDATE_FOLDER = 'FOLDER';
export const UPDATE_SETTING = 'SETTING';

export interface IFolder {
  name: string;
  dir: string;
}

export interface IReduxState {
  currFolderIndex: number;
  setting: ISetting;
  folders: IFolder[];
}

export interface IChangeFolderAction {
  type: typeof CHANGE_FOLDER;
  payload: number;
}

export interface IFolderAction {
  type: typeof UPDATE_FOLDER;
  payload: IFolder[];
}

export interface ISettingAction {
  type: typeof UPDATE_SETTING;
  payload: ISetting;
}
