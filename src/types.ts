export interface Themes {
  defaultThemeId: string;
  themeList: Theme[];
}

export interface Theme {
  id: string;
  name: string;
  searchTerms: string[];
}

export interface SearchCriteria {
  themeId: string;
  searchTerms: string[];
  searchTypes: SearchType[];
  searchYear: string;
  newTracks: true,
}

export enum SearchType {
  track = "track",
  album = "album"
}

export interface NewResults {
  searchDetails: SearchDetails;
  spotifyResults: SpotifyApiSearchResult[];
}

export interface SearchDetails {
  key: string;
  searchTerm: string;
  searchType: SearchType;
  searchYear: string;
  totalCount?: number;
  totalLoaded: number;
  next?: string;
  // results?: SpotifyApiSearchResult[];
}

export interface FinalResults {
  searchTerm: string;
  themeId?: string;
  searches: SearchDetails[];
  tracks: Track[],
  albums: Album[],
  searchDate: string, // Date when the search was first initiated
  filters?: Filters;
}

export interface Filters {
  excludeListened: boolean;
  excludeArtistNames: string[];
  excludeKeywords: string[];
}

export interface GroupedSearches {
  groupList: SearchGroup[]
}

export interface SearchGroup {
  searchTerm: string;
  searches: SearchDetails[];
}

export interface SearchItem {
  listened?: boolean;
  name: string;
  image?: string;
  link: string;
  uri: string;
  id: string;
  artists: string;
  releaseDate?: string;
  dateLoaded: string;
}
export interface Track extends SearchItem {
  album?: string;
}

export interface Album extends SearchItem {
}

export interface SpotifyApiSearchResult {
  tracks: SpotifyApiSearchResultGroup<SpotifyApiSearchTrack>;
  albums: SpotifyApiSearchResultGroup<SpotifyApiSearchAlbum>
  next: string;
}
export interface SpotifyApiSearchResultGroup<T> {
  items: T[]
  href: string; // original search url
  limit: number;
  next: string | null;
  offset: 0
  previous: string | null;
  total: number;
}

export interface SpotifyApiSearchTrack {
  name: string;
  album?: SpotifyApiSearchAlbum;
  external_urls: SpotifyApiExternalUrls;
  uri: string;
  artists: SpotifyApiSearchArtist[];
  id: string;
}

export interface SpotifyApiSearchAlbum {
  images: SpotifyApiImage[];
  name: string;
  release_date: string;
  external_urls: SpotifyApiExternalUrls,
  uri: string;
  id: string;
  artists: SpotifyApiSearchArtist[];
  album_type: 'album' | 'single';
}

export interface SpotifyApiSearchArtist {
  name: string;
}

export interface SpotifyApiImage {
  url: string;
}
export interface SpotifyApiExternalUrls {
  spotify: string;
}

export interface SpotifySearchResults {
  searchDetails: SearchDetails;
  results?: SpotifyApiSearchResult[];
}

export interface SpotifyToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_on: number; // Added
  created_on: number; // Added
}


export interface ResultItem {
  uri: string;
  track?: Track;
  album?: Album;
}
