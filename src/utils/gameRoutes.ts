export type GameRouteMode = "play" | "details";

export interface GameRoute {
  gameId: string;
  mode: GameRouteMode;
}

export function gamePlayRoute(gameId: string) {
  return `/games/${encodeURIComponent(gameId)}`;
}

export function gameDetailsRoute(gameId: string) {
  return `/games/${encodeURIComponent(gameId)}/details`;
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
  const match = path.match(/^\/games\/([^/]+)(?:\/(details))?$/);

  if (!match) {
    return null;
  }

  return {
    gameId: decodeURIComponent(match[1]),
    mode: match[2] === "details" ? "details" : "play",
  };
}
