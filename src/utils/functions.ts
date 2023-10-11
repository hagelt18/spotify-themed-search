import axios from 'axios';

export const getParamValues = (url: string) => {
  return url
    .slice(1)
    .split('&')
    .reduce((prev: any, curr: string) => {
      const [title, value] = curr.split('=');
      prev[title] = value;
      return prev;
    }, {});
};

export const getSpotifyAuthToken = () => {
  const paramsStr = localStorage.getItem('params');
  const params = paramsStr ? JSON.parse(paramsStr) : undefined;
  return params?.access_token;
}
export const setAuthHeader = () => {
  try {
    const authToken = getSpotifyAuthToken();
    if (authToken) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${authToken}`;
    }
  } catch (error) {
    console.log('Error setting auth', error);
  }
};
