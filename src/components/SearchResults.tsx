import "./SearchPage.css";
import React, { useMemo } from "react";
import { Button, Tab, Tabs } from "react-bootstrap";
import { FaEyeSlash, FaUserSlash } from "react-icons/fa";
import {
  ResultItem,
  Album,
  SearchGroupItem,
  Track,
  SearchDetails,
  SearchType,
} from "../types";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../store/store";
import { SearchState } from "../reducers/searchReducer";
import {
  searchComplete,
  setItemListened,
  setSelectedItem,
  updateFilters,
} from "../actions/searchActions";
import { loadMore } from "../api/spotify-api";

export interface SearchResultsProps {
  hideListenedToItems: boolean;
}
export const SearchResults = (props: SearchResultsProps) => {
  const dispatch = useDispatch();
  const { results, selectedItem } = useSelector<AppState>(
    (store) => store.search,
  ) as SearchState;

  const filteredResults = useMemo(() => {
    const applyFilter = Boolean(
      props.hideListenedToItems ||
        results?.filters?.excludeArtistNames?.length ||
        results?.filters?.excludeKeywords?.length,
    );
    if (!applyFilter || !results) {
      return results;
    }

    const filter = (item: SearchGroupItem) => {
      if (props.hideListenedToItems && item.listened) {
        return false;
      }
      if (
        results.filters?.excludeArtistNames?.length &&
        results.filters?.excludeArtistNames.some(
          (artistName) =>
            item.artists?.toLowerCase().includes(artistName?.toLowerCase()),
        )
      ) {
        // console.log(`filtered ${item.name} due to a filtered artist name`);
        return false;
      }
      if (
        results.filters?.excludeKeywords?.length &&
        results.filters?.excludeKeywords.some(
          (keyword) =>
            item.name?.toLowerCase().includes(keyword?.toLowerCase()) ||
            item.artists?.toLowerCase().includes(keyword?.toLowerCase()) ||
            (item as Track)?.album
              ?.toLowerCase()
              .includes(keyword?.toLowerCase()),
        )
      ) {
        // console.log(`filtered ${item.name} due to a filtered keyword`);
        return false;
      }
      return true;
    };

    return {
      ...results,
      tracks: results.tracks.filter(filter),
      albums: results.albums.filter(filter),
    };
  }, [props.hideListenedToItems, results]);

  const nextTrackSearchToRun = useMemo(
    () =>
      results?.searches.find(
        (s) =>
          s.searchType === SearchType.track &&
          (s.totalLoaded || 0) < (s.totalCount || 0),
      ),
    [results?.searches],
  );
  const nextAlbumSearchToRun = useMemo(
    () =>
      results?.searches.find(
        (s) =>
          s.searchType === SearchType.album &&
          (s.totalLoaded || 0) < (s.totalCount || 0),
      ),
    [results?.searches],
  );

  const onLoadMoreTracksClicked = async () => {
    loadMoreResults(nextTrackSearchToRun);
  };

  const onLoadMoreAlbumsClicked = async () => {
    loadMoreResults(nextAlbumSearchToRun);
  };

  const loadMoreResults = async (nextSearch?: SearchDetails) => {
    if (!results) {
      alert("No existing results to add to.");
      return;
    }
    if (!nextSearch) {
      alert("No additional searches left to run.");
      return;
    }
    const newResults = await loadMore(results, nextSearch);
    dispatch(
      searchComplete({
        results: { ...newResults },
      }),
    );
  };

  const onTrackClicked = (track: Track) => {
    if (selectedItem?.uri !== track.uri) {
      selectedItem && markItemListened(selectedItem);
      dispatch(setSelectedItem({ uri: track.uri, track }));
    }
  };

  const onTrackIgnore = (track: Track) => {
    // TODO - Allow ignoring tracks, artists, or albums.
    markItemListened({ uri: track.uri, track });
  };

  const onArtistIgnore = (track: Track) => {
    dispatch(
      updateFilters({
        excludeArtistNames: [
          ...(results?.filters?.excludeArtistNames || []),
          track.artists,
        ],
      }),
    );
  };

  const onAlbumClicked = (album: Album) => {
    if (selectedItem?.uri !== album.uri) {
      selectedItem && markItemListened(selectedItem);
      dispatch(setSelectedItem({ uri: album.uri, album }));
    }
  };

  const onAlbumIgnore = (album: Album) => {
    // TODO - Allow ignoring tracks, artists, or albums.
    markItemListened({ uri: album.uri, album });
  };

  const markItemListened = (item: ResultItem) => {
    dispatch(setItemListened(item));
  };

  return (
    <>
      <Tabs defaultActiveKey="tab-tracks">
        <Tab eventKey="tab-tracks" title="Tracks" key="tab-tracks">
          <div style={{}}>
            {filteredResults?.tracks?.map((track) => {
              const isSelected =
                selectedItem && selectedItem?.uri === track.uri;
              return (
                <div
                  key={`TRACK_${track.name}_${track.id}`}
                  className={`result-item ${isSelected ? "selected" : ""}`}
                >
                  <Button
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                    }}
                    onClick={() => {
                      onTrackClicked(track);
                    }}
                  >
                    ▶
                  </Button>
                  <img
                    src={track.image}
                    alt="Track/Song"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <a
                    href={track.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <strong>
                      "{track.name}" by {track.artists}
                    </strong>
                    {track.listened ? " (listened)" : ""}
                  </a>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "nowrap",
                    }}
                  >
                    <button
                      className="btn-icon"
                      style={{ width: "40px", height: "40px" }}
                      onClick={() => {
                        onTrackIgnore(track);
                      }}
                    >
                      <FaEyeSlash />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ width: "40px", height: "40px" }}
                      onClick={() => {
                        onArtistIgnore(track);
                      }}
                    >
                      <FaUserSlash />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredResults?.tracks.length === 0 && nextTrackSearchToRun && (
              <Button
                variant="outline-primary"
                onClick={() => onLoadMoreTracksClicked()}
              />
            )}
          </div>
        </Tab>
        <Tab eventKey="tab-albums" title="Albums" key="tab-albums">
          <div style={{}}>
            {filteredResults?.albums?.map((album) => {
              const isSelected =
                selectedItem && selectedItem?.uri === album.uri;
              return (
                <div
                  key={`ALBUM_${album.name}_${album.id}`}
                  className={`result-item ${isSelected ? "selected" : ""}`}
                >
                  <Button
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                    }}
                    onClick={() => {
                      onAlbumClicked(album);
                    }}
                  >
                    ▶
                  </Button>
                  <img
                    src={album.image}
                    alt="Album"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <a href={album.link}>
                    <strong>
                      "{album.name}" by {album.artists}
                    </strong>
                  </a>
                  <Button
                    className="btn-icon"
                    style={{ width: "40px", height: "40px" }}
                    onClick={() => {
                      onAlbumIgnore(album);
                    }}
                  >
                    <FaEyeSlash />
                  </Button>
                </div>
              );
            })}
            {filteredResults?.albums.length === 0 && nextAlbumSearchToRun && (
              <Button
                variant="outline-primary"
                onClick={() => onLoadMoreAlbumsClicked()}
              >
                Load More
              </Button>
            )}
          </div>
        </Tab>
      </Tabs>
    </>
  );
};
