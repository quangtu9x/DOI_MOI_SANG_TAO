export const toAbsoluteUrl = (pathname: string) => {
  if (pathname.startsWith('/')) {
    pathname = pathname.substring(1);
  }

  return process.env.REACT_APP_FILE_URL + '/' + pathname;
};
