export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  downloadUrls?: any;
}

export interface IMusicProvider {
  search(query: string): Promise<Song[]>;
  getSuggestions(songId: string): Promise<Song[]>;
  getStreamUrl(song: Song): Promise<string | null>;
}
