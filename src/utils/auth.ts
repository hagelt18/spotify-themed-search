import axios from 'axios';
import { SpotifyToken } from '../types';
import { SPOTIFY_TOKEN_URL } from './constants';

export const generateRandomString = (length: number): string => {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export const generateCodeChallenge = async (codeVerifier: string) => {
  function base64encode(string: ArrayBuffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string) as any))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}

export const getSpotifyAuthTokenData = (): SpotifyToken | undefined => {
  const spotifyTokenData = localStorage.getItem('spotify_token');
  const spotifyToken = spotifyTokenData ? JSON.parse(spotifyTokenData) as SpotifyToken : undefined;
  return spotifyToken;
}
export const setAuthHeader = () => {
  try {
    const authTokenData = getSpotifyAuthTokenData();
    const authToken = authTokenData?.access_token;
    if (authToken) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${authToken}`;
    }
  } catch (error) {
    console.log('Error setting auth', error);
  }
};

export const refreshToken = async () => {
  const spotifyAuthTokenData = getSpotifyAuthTokenData();
  var refresh_token = spotifyAuthTokenData?.refresh_token || '';
  const {
    VITE_APP_CLIENT_ID,
  } = import.meta.env;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
    client_id: VITE_APP_CLIENT_ID || '',
  });
  const response = await fetch(SPOTIFY_TOKEN_URL || '', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  })
  if (!response.ok) {
    throw new Error('HTTP status ' + response.status);
  }
  const data = await response.json();
  console.log('Got new token: ', data);
  saveToken(data.access_token);
}

export const isTokenExpired = () => {
  const spotifyTokenData = getSpotifyAuthTokenData();
  if (!spotifyTokenData?.expires_on) {
    console.log("Invalid session: Token is missing or doesn't have expiration value");
    return true;
  }
  const expires_on = new Date(spotifyTokenData.expires_on || '');
  const currentDate = new Date();
  const currentTime = currentDate.getTime();
  const isExpired = expires_on.getTime() <= currentTime;
  if (isExpired) {
    console.log("Token expired", { expires_on, currentDate, check: `${expires_on.getTime()} <= ${currentTime}` });
  }
  return isExpired;
}

export const saveToken = async (spotifyTokenData: any) => {

  const createdOn = new Date();
  const expires_in_ms = Number(spotifyTokenData.expires_in) * 1000;
  const expiresOn = new Date(createdOn.getTime() + expires_in_ms);
  localStorage.setItem('spotify_token', JSON.stringify({
    ...spotifyTokenData,
    created_on: createdOn,
    expires_on: expiresOn,
  }));
}