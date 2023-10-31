import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getSpotifyAuthTokenData } from '../utils/auth';
import { useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { SearchState } from '../reducers/searchReducer';
import './SpotifyWebPlayer.css';
import { Button, Form, Spinner } from 'react-bootstrap';
import { FaStepBackward, FaStepForward, FaPlayCircle, FaPauseCircle } from 'react-icons/fa';
import { getAlbum, playItem, updatePlaybackPosition } from '../api/spotify-api';
import { usePrevious } from '../utils/usePrevious';

export interface SpotifyPlayerProps { }
export const SpotifyWebPlayer = (props: SpotifyPlayerProps) => {

  const [player, setPlayer] = useState<Spotify.Player>();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Spotify.Track>();
  const previouslyPlaying = usePrevious(currentlyPlaying);
  const [deviceId, setDeviceId] = useState<string>();
  const previousDeviceId = usePrevious(deviceId);
  const [paused, setPaused] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  // const [timestamp, setTimestamp] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useRef<boolean>(false);
  const { selectedItem } = useSelector<AppState>((store) => store.search) as SearchState;

  const rangeRef = useRef<HTMLInputElement | null>(null);
  const currentInterval = useRef<any>();
  const intervalMs = 300;
  const onInterval = () => {
    console.log('Playback position interval hit', {
      paused,
      rangeRefValue: rangeRef.current?.value,
      duration
    })
    if (!paused) {
      setPlaybackPosition(c => {
        console.log(`Updateing position from ${c} to ${c + intervalMs}`)
        if (c + intervalMs > duration) {
          return duration;
          // return 0;
        } else {
          return c + intervalMs;
        }
      });
    }
  };

  // Currently playing song changed (even if not from within this app)
  useEffect(() => {
    restartPlaybackTracking();
  }, [currentlyPlaying])

  const restartPlaybackTracking = () => {
    if (currentlyPlaying?.id !== previouslyPlaying?.id) {
      console.log('Currently playing song changed: ', currentlyPlaying);
      if (currentInterval.current) {
        clearInterval(currentInterval.current)
      }
      currentInterval.current = setInterval(onInterval, intervalMs)
    }
  }

  // Update song time tracker control
  useEffect(() => {
    if (rangeRef.current) {
      rangeRef.current.value = playbackPosition.toString();
    }
  }, [playbackPosition]);

  // On Mount - Initialize spotify web player script
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;


      window.onSpotifyWebPlaybackSDKReady = () => {
        const authTokenData = getSpotifyAuthTokenData();
        const player = new window.Spotify.Player({
          name: 'Spotify Themed Search',
          getOAuthToken: cb => { cb(authTokenData?.access_token || ''); },
          volume: 0.5
        });
        setPlayer(player);
      }
      document.body.appendChild(script);
    }
    return () => {
      // On unmount
      // window.removeEventListener('onSpotifyWebPlaybackSDKReady', onSpotifyWebPlaybackSDKReady);
    }
  }, []);

  const onPlayerStateChange = (state: Spotify.PlaybackState): ReturnType<Spotify.PlaybackStateListener> => {

    console.log('player_state_changed', { state });

    if (!state) {
      return;
    }

    setPaused(state.paused);
    setDuration(state.duration);
    // setTimestamp(state.timestamp);
    setPlaybackPosition(state.position);
    setCurrentlyPlaying(state.track_window.current_track);
    setLoading(state.loading);

    player?.getCurrentState().then(state => {
      setActive(Boolean(state));
    });
  };

  useEffect(() => {

    if (player) {

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.on('initialization_error', e => console.error(e));
      player.on('authentication_error', e => console.error(e));
      player.on('account_error', e => console.error(e));
      player.on('playback_error', e => console.error(e));
      player.addListener('player_state_changed', onPlayerStateChange);

      player.connect();
    }
  }, [player]);

  const getDisplayTime = (timeMs: number) => {
    var seconds = Math.floor((timeMs / 1000) % 60).toString().padStart(2, '0');
    var minutes = Math.floor((timeMs / (60 * 1000)) % 60).toString().padStart(2, '0');
    return minutes + ":" + seconds;
  }

  useEffect(() => {
    // Play the selected song on initial load
    if (deviceId && selectedItem && (previousDeviceId !== deviceId)) {
      console.log("Device Id changed, playing song on current device: ", selectedItem);
      playSelectedItem();
    }
  }, [deviceId, selectedItem]);

  const playSelectedItem = async () => {
    if (selectedItem && deviceId) {
      try {
        if (selectedItem.track) {
          await playItem({ uris: [selectedItem.uri], deviceId });
        } else if (selectedItem.album) {
          const album = await getAlbum(selectedItem.album.id);
          const uris = album?.tracks?.items?.map(i => i.uri) || [];
          await playItem({ uris, deviceId });
        }
      } catch (err) {
        console.log(err);
        alert("Error playing song...");
      }
    }
  }

  const onPlaybackPositionChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (deviceId) {
      try {
        const newPosition = Number(e.target.value);
        await updatePlaybackPosition({ deviceId, playbackPosition: newPosition });
      } catch (err) {
        console.log(err);
        alert("Error playing song...");
      }
    }
  }

  return (
    <div>
      {player ?
        (
          <div style={{ display: 'flex', gap: '4px' }}>
            <div className='spotify-web-player-artwork flex-center'>
              {loading
                // ? <Spinner style={{ width: '100%', height: '100%', margin: '50px' }} />
                ? <Spinner />
                : <img src={currentlyPlaying?.album.images[0].url} alt="album artwork" style={{ width: '100%', height: '100%' }} />
              }
            </div>


            <div className="spotify-web-player-control-area" style={{ flex: 1, textAlign: 'center' }}>
              <div className="spotify-web-player-track-description" style={{ fontSize: '12px' }}>
                "{currentlyPlaying?.name}" by {currentlyPlaying?.artists.map(a => a.name)?.join(', ') || ''}
              </div>
              <div style={{ width: '100%', display: 'flex', gap: '4px', marginLeft: '10px', marginRight: '10px', fontSize: '14px' }}>
                <div>{getDisplayTime(playbackPosition)}</div>
                <Form.Range min={0} max={duration} ref={rangeRef} style={{ flex: 1 }} onChange={onPlaybackPositionChanged} />
                <div>{getDisplayTime(duration)}</div>
              </div>


              <div style={{ width: '100%', textAlign: 'center' }}>
                <button
                  className="btn-icon"
                  style={{ width: '30px', height: '30px' }}
                  onClick={() => { player.previousTrack() }}>
                  <FaStepBackward />
                </button>
                <button
                  className="btn-icon"
                  style={{ width: '30px', height: '30px', marginLeft: '10px', marginRight: '10px' }}
                  onClick={() => {
                    console.log("Play/Pause Clicked");
                    player.togglePlay()
                  }}>
                  {!paused ? <FaPauseCircle /> : <FaPlayCircle />}
                </button>
                <button
                  className="btn-icon"
                  style={{ width: '30px', height: '30px' }}
                  onClick={() => { player.nextTrack() }}>
                  <FaStepForward />
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div>
            {loading ? <Spinner /> : <span>Player not loaded</span>}
          </div>
        )}
    </div>
  )
}