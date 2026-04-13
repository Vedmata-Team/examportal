import crypto from "node:crypto";
import type { Response } from "express";

const COOKIE_NAME = "exam_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const secret = process.env.SESSION_SECRET || process.env.DATABASE_URL || "dev-session-secret";

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")): string {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}

export function createSessionToken(userId: number): string {
  const payload = base64url(JSON.stringify({
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: unknown; exp?: unknown };
    if (typeof data.userId !== "number" || typeof data.exp !== "number") return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.userId;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, userId: number): void {
  res.cookie(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}