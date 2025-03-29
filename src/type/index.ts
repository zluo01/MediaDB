export enum SORT {
  DEFAULT,
  TITLE_ASC,
  TITLE_DSC,
  YEAR_ASC,
  YEAR_DSC,
}

export interface IFolderInfo {
  sort: SORT;
}

export interface IFolderData extends IFolder, IFolderInfo {
  status: FolderStatus;
  filterType: FilterType;
}

export enum MediaType {
  MOVIE,
  TV_SERIES,
  COMIC,
}

export enum FilterType {
  OR,
  AND,
}

export interface IBaseData {
  readonly title: string;
  readonly posters: Record<string, string>;
  readonly path: string;
}

export interface IMovieData extends IBaseData {
  readonly type: MediaType.MOVIE;
  readonly file: string;
  readonly year: string;
}

export interface ITVShowData extends IBaseData {
  readonly type: MediaType.TV_SERIES;
  readonly seasons: Record<string, IEpisode[]>;
}

export interface IEpisode {
  readonly title: string;
  readonly file: string;
  readonly season: number;
  readonly episode: number;
  readonly path: string;
}

export interface IComicData extends IBaseData {
  readonly type: MediaType.COMIC;
  readonly file: string;
}

export type IMediaData = IMovieData | ITVShowData | IComicData;

export interface ISetting {
  readonly showSidePanel: boolean;
  readonly skipFolders: string[];
}

export interface IFolder {
  readonly name: string;
  readonly path: string;
  readonly position: number;
}

export enum FolderStatus {
  NONE,
  LOADING,
  ERROR,
}

export type FilterOption = {
  readonly group: string; // tag group
  readonly label: string;
};

export type GroupedOption = {
  readonly label: string;
  readonly options: FilterOption[];
};

export enum InvalidationType {
  FOLDER_LIST,
  FOLDER_INFORMATION,
}

export interface InvalidationPayload {
  t: InvalidationType;
  id: number;
}
