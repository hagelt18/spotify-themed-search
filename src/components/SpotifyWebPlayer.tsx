import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getSpotifyAuthTokenData } from '../utils/auth';
import { useSelector } from 'react-redux';
import { AppState } from '../store/store';
import { SearchState } from '../reducers/searchReducer';
import './SpotifyWebPlayer.css';
import { Button, Form, Spinner } from 'react-bootstrap';
import { FaStepBackward, FaStepForward, FaPlayCircle, FaPauseCircle } from 'react-icons/fa';

export interface SpotifyPlayerProps { }
export const SpotifyWebPlayer = (props: SpotifyPlayerProps) => {

  const [player, setPlayer] = useState<Spotify.Player>();
  const previouslyPlaying = useRef<Spotify.Track>()
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Spotify.Track>();
  const [deviceId, setDeviceId] = useState<string>();
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
    if (!paused) {
      setPlaybackPosition(c => c + intervalMs);
    }
    if (playbackPosition >= duration) {
      clearInterval(currentInterval.current);
    }
  };

  // Currently playing song changed (even if not from within this app)
  useEffect(() => {
    if (!currentlyPlaying || !player) {
      delete previouslyPlaying.current;
      return;
    }
    if (currentlyPlaying.id !== previouslyPlaying.current?.id) {
      console.log('Currently playing song changed: ', currentlyPlaying);
      if (currentInterval.current) {
        clearInterval(currentInterval.current)
      }
      currentInterval.current = setInterval(onInterval, intervalMs)
    }
    previouslyPlaying.current = currentlyPlaying;
  }, [currentlyPlaying])

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
          name: 'Web Playback SDK',
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
    if (deviceId && selectedItem) {
      console.log("Selected item changed. Now playing: ", selectedItem);
      playSelectedItem();
    }
  }, [deviceId, selectedItem]);

  const playSelectedItem = async () => {
    const authTokenData = getSpotifyAuthTokenData();
    const url = "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId;
    try {
      await fetch(url, {
        method: "PUT",
        body: `{"uris": ["${selectedItem?.uri}"]}`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authTokenData?.access_token || ''}`,
        }
      });
    } catch (err) {
      console.log(err);
      alert("Error playing song...");
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
              <div style={{ width: '100%', display: 'flex', gap: '4px' }}>
                <div>{getDisplayTime(playbackPosition)}</div>
                <Form.Range min={0} max={duration} ref={rangeRef} style={{ flex: 1 }} />
                <div>{getDisplayTime(duration)}</div>
              </div>


              <div style={{ width: '100%', textAlign: 'center' }}>
                <Button
                  className="btn-icon"
                  style={{ width: '50px', height: '50px' }}
                  onClick={() => { player.previousTrack() }}>
                  <FaStepBackward />
                </Button>
                <Button
                  className="btn-icon"
                  style={{ width: '50px', height: '50px' }}
                  onClick={() => {
                    console.log("Play/Pause Clicked");
                    player.togglePlay()
                  }}>
                  {!paused ? <FaPauseCircle /> : <FaPlayCircle />}
                </Button>
                <Button
                  className="btn-icon"
                  style={{ width: '50px', height: '50px' }}
                  onClick={() => { player.nextTrack() }}>
                  <FaStepForward />
                </Button>
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