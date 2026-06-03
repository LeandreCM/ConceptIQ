export interface GameRoute {
  gameId: string;
}

export function gamePlayRoute(gameId: string) {
  return `/games/${encodeURIComponent(gameId)}`;
}

export function parseGameRoute(pathname: string, hash: string): GameRoute | null {
  return parseRoutePath(pathname) ?? parseRouteHash(hash);
}

function parseRouteHash(hash: string) {
  const value = hash.replace(/^#\/?/, "");

  if (!value.startsWith("games/")) {
    return null;
  }

  return parseRoutePath(`/${value}`);
}

function parseRoutePath(pathname: string): GameRoute | null {
  const path = pathname.replace(/\/$/, "");
  const match = path.match(/^\/games\/([^/]+)$/);

  if (!match) {
    return null;
  }

  return {
    gameId: decodeURIComponent(match[1]),
  };
}
