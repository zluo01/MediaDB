export const MOVIE = 'movie';
export const TV_SERIES = 'tvshow';

type Media = typeof MOVIE | typeof TV_SERIES;

export interface IFolderInfo {
  tags: string[];
  genres: string[];
  data: IMediaData[];
}

export interface IMediaData {
  type: Media;
  file: string;
  title: string;
  year: string;
  poster: string;
  fanart: string;
  genre: string[];
  tag: string[];
}

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
