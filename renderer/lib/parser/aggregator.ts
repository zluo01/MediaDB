import { IMovieData, ITVShowData } from '../../type';

export class TagAggregator {
  tags: Set<string>;
  genres: Set<string>;
  actors: Set<string>;
  studios: Set<string>;

  constructor() {
    this.tags = new Set<string>();
    this.genres = new Set<string>();
    this.actors = new Set<string>();
    this.studios = new Set<string>();
  }

  aggregate(info: IMovieData | ITVShowData) {
    info.tags.forEach(o => this.tags.add(o));
    info.genres.forEach(o => this.genres.add(o));
    info.actors.forEach(o => this.actors.add(o));
    info.studios.forEach(o => this.studios.add(o));
  }

  getTags(): string[] {
    this.tags.delete('');
    return Array.from(this.tags);
  }

  getGenres(): string[] {
    this.genres.delete('');
    return Array.from(this.genres);
  }

  getActors(): string[] {
    this.actors.delete('');
    return Array.from(this.actors);
  }

  getStudios(): string[] {
    this.studios.delete('');
    return Array.from(this.studios);
  }
}
