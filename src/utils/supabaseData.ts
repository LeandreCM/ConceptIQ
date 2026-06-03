import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { CognitiveAttempt, GameResult, GameType, LeaderboardUser, UserProfile } from "../types";
import type { CognitiveDomainId } from "../types/cognition";
import type { Database, Json } from "../types/supabase";
import { averageReactionTime } from "./format";
import { normalizeCognitiveProfile } from "./cognitiveProfile";
import { defaultProfile } from "./storage";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AttemptRow = Database["public"]["Tables"]["attempts"]["Row"];

export async function fetchRemoteProfile(user: User): Promise<UserProfile> {
  assertSupabase();
  await ensureRemoteProfile(user);

  const [{ data: profileRow, error: profileError }, { data: attempts, error: attemptsError }, { data: userAchievements, error: achievementsError }] =
    await Promise.all([
      supabase!
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
      supabase!
        .from("attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase!
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id),
    ]);

  if (profileError) throw profileError;
  if (attemptsError) throw attemptsError;
  if (achievementsError) throw achievementsError;

  return profileRowToUserProfile(
    profileRow,
    attempts ?? [],
    (userAchievements ?? []).map((achievement) => achievement.achievement_id),
  );
}

export async function saveRemoteGameState(userId: string, profile: UserProfile, result: GameResult) {
  assertSupabase();

  const unlockedAchievementIds = result.unlockedAchievementIds ?? [];

  const profileResult = await upsertProfile(userId, profile);

  if (profileResult.error) {
    throw profileResult.error;
  }

  const attemptResult = await supabase!.from("attempts").insert({
    user_id: userId,
    game_type: result.gameType,
    raw_score: result.rawScore,
    normalized_score: result.normalizedScore,
    mistakes: result.mistakes,
    duration_ms: result.durationMs,
    score_before: result.conceptIQBefore ?? 0,
    score_after: result.conceptIQAfter ?? profile.conceptIQScore,
    score_change: result.conceptIQChange ?? 0,
    created_at: result.timestamp,
  });

  if (attemptResult.error) {
    throw attemptResult.error;
  }

  if (unlockedAchievementIds.length) {
    const availableAchievements = await supabase!
      .from("achievements")
      .select("id")
      .in("id", unlockedAchievementIds);

    if (availableAchievements.error) {
      throw availableAchievements.error;
    }

    const availableIds = new Set((availableAchievements.data ?? []).map((achievement) => achievement.id));
    const userAchievementRows = unlockedAchievementIds
      .filter((achievementId) => availableIds.has(achievementId))
      .map((achievementId) => ({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: result.timestamp,
      }));

    if (!userAchievementRows.length) {
      return;
    }

    const achievementResult = await supabase!.from("user_achievements").upsert(userAchievementRows);

    if (achievementResult.error) {
      throw achievementResult.error;
    }
  }
}

export async function saveRemoteProfile(userId: string, profile: UserProfile) {
  assertSupabase();
  const { error } = await upsertProfile(userId, profile);

  if (error) throw error;
}

export async function resetRemoteProgress(userId: string, profile: UserProfile) {
  assertSupabase();

  const resetProfile = {
    ...defaultProfile,
    id: userId,
    username: profile.username,
    displayName: profile.displayName,
  };
  const [attemptsResult, achievementsResult, profileResult] = await Promise.all([
    supabase!.from("attempts").delete().eq("user_id", userId),
    supabase!.from("user_achievements").delete().eq("user_id", userId),
    upsertProfile(userId, resetProfile),
  ]);
  const error = attemptsResult.error ?? achievementsResult.error ?? profileResult.error;

  if (error) throw error;

  return resetProfile;
}

export async function fetchRemoteLeaderboard() {
  assertSupabase();
  const { data, error } = await supabase!
    .from("profiles")
    .select(
      "id, username, display_name, conceptiq_score, growth_score, consistency_score, reaction_score, memory_score, pattern_score, best_reaction_time, average_reaction_time",
    )
    .order("conceptiq_score", { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data ?? []).map(
    (row): LeaderboardUser => ({
      id: row.id,
      username: row.display_name || row.username,
      displayName: row.display_name ?? undefined,
      conceptIQScore: row.conceptiq_score,
      growthScore: row.growth_score,
      consistencyScore: row.consistency_score,
      categoryScores: {
        reaction: row.reaction_score,
        memory: row.memory_score,
        pattern: row.pattern_score,
      },
      bestReactionTime: row.best_reaction_time,
      averageReactionTime: row.average_reaction_time,
    }),
  );
}

async function ensureRemoteProfile(user: User) {
  assertSupabase();
  const username = user.user_metadata.username || user.email?.split("@")[0] || "conceptiq-user";
  const displayName = user.user_metadata.display_name || username;
  const { error } = await supabase!.from("profiles").upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (error) throw error;
}

function profileRowToUserProfile(row: ProfileRow, attemptRows: AttemptRow[], achievementIds: string[]): UserProfile {
  const history = attemptRows.map(attemptRowToResult);
  const attempts = attemptRows.map(attemptRowToAttempt);
  const failCounts = parseFailCounts(row.fail_counts);

  return {
    ...defaultProfile,
    id: row.id,
    username: row.username,
    displayName: row.display_name ?? row.username,
    conceptIQScore: row.conceptiq_score,
    abilityScore: row.ability_score,
    growthScore: row.growth_score,
    consistencyScore: row.consistency_score,
    gamesPlayed: row.games_played || attemptRows.length,
    bestReactionTime: row.best_reaction_time,
    bestMemoryScore: row.best_memory_score,
    bestPatternScore: row.best_pattern_score,
    achievementsUnlocked: achievementIds,
    sessions: attemptRows.map((attempt) => attempt.created_at),
    categoryScores: {
      reaction: row.reaction_score,
      memory: row.memory_score,
      pattern: row.pattern_score,
    },
    domainScores: parseDomainScores(row.domain_scores),
    cognitiveProfile: normalizeCognitiveProfile(parseCognitiveProfile(row.cognitive_profile)),
    history,
    attempts,
    failCounts,
    maxGamesInSession: row.max_games_in_session,
  };
}

function profileToProfileUpsert(userId: string, profile: UserProfile) {
  return {
    id: userId,
    username: profile.username,
    display_name: profile.displayName,
    conceptiq_score: profile.conceptIQScore,
    ability_score: profile.abilityScore,
    growth_score: profile.growthScore,
    consistency_score: profile.consistencyScore,
    reaction_score: profile.categoryScores.reaction,
    memory_score: profile.categoryScores.memory,
    pattern_score: profile.categoryScores.pattern,
    domain_scores: profile.domainScores,
    cognitive_profile: profile.cognitiveProfile as unknown as Json,
    games_played: profile.gamesPlayed,
    best_reaction_time: profile.bestReactionTime,
    average_reaction_time: averageReactionTime(profile.history),
    best_memory_score: profile.bestMemoryScore,
    best_pattern_score: profile.bestPatternScore,
    max_games_in_session: profile.maxGamesInSession,
    fail_counts: profile.failCounts,
    updated_at: new Date().toISOString(),
  };
}

async function upsertProfile(userId: string, profile: UserProfile) {
  const row = profileToProfileUpsert(userId, profile);
  const result = await supabase!.from("profiles").upsert(row);

  if (!isMissingOptionalProfileColumn(result.error)) {
    return result;
  }

  const { domain_scores: _domainScores, cognitive_profile: _cognitiveProfile, ...fallbackRow } = row;
  return supabase!.from("profiles").upsert(fallbackRow);
}

function attemptRowToAttempt(row: AttemptRow): CognitiveAttempt {
  return {
    id: row.id,
    attemptedAt: row.created_at,
    gameType: row.game_type,
    rawScore: row.raw_score,
    normalizedScore: row.normalized_score,
    mistakes: row.mistakes,
    durationMs: row.duration_ms,
    scoreBefore: row.score_before,
    scoreAfter: row.score_after,
    scoreChange: row.score_change,
  };
}

function attemptRowToResult(row: AttemptRow): GameResult {
  return {
    id: row.id,
    gameType: row.game_type,
    title: resultTitle(row.game_type, row.raw_score),
    rawScore: row.raw_score,
    categoryScore: row.normalized_score,
    normalizedScore: row.normalized_score,
    percentileLabel: "Saved account result",
    whatImproved: "Persistent attempt data was loaded from your account.",
    trainNext: "Use your Cognitive Profile recommendation for the next challenge.",
    timestamp: row.created_at,
    metrics: [
      { label: "Raw score", value: String(row.raw_score) },
      { label: "Normalized score", value: `${row.normalized_score}/1000` },
    ],
    mistakes: row.mistakes,
    durationMs: row.duration_ms,
    reactionTimeMs: row.game_type === "reaction" ? row.raw_score : undefined,
    conceptIQBefore: row.score_before,
    conceptIQAfter: row.score_after,
    conceptIQChange: row.score_change,
    wasFailure: row.normalized_score < 250,
  };
}

function resultTitle(gameType: GameType, rawScore: number) {
  if (gameType === "reaction") return `${rawScore}ms reaction`;
  if (gameType === "memory") return `${rawScore} recalled`;
  return `${rawScore} patterns solved`;
}

function parseFailCounts(value: Json) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      reaction: Number(value.reaction ?? 0),
      memory: Number(value.memory ?? 0),
      pattern: Number(value.pattern ?? 0),
    };
  }

  return defaultProfile.failCounts;
}

function parseDomainScores(value: Json | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, score]) => [key, Number(score)])
        .filter(([, score]) => Number.isFinite(score)),
    ) as Partial<Record<CognitiveDomainId, number>>;
  }

  return defaultProfile.domainScores;
}

function parseCognitiveProfile(value: Json | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return defaultProfile.cognitiveProfile;
}

function isMissingOptionalProfileColumn(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const details = "details" in error && typeof error.details === "string" ? error.details : "";
  return /(domain_scores|cognitive_profile)/i.test(`${message} ${details}`) && /column|schema cache|could not find/i.test(`${message} ${details}`);
}

function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
}
