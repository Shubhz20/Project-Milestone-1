import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { BadRequestError, ConflictError, UnauthorizedError } from "../errors/AppError";
import { IUser } from "../models/User";

// Set a known JWT secret for the duration of these tests so we can verify
// issued tokens without booting any real infrastructure.
process.env.JWT_SECRET = "test-secret-do-not-use-in-prod";

const makeFakeUser = async (overrides: Partial<IUser> = {}) => {
  const hashed = await bcrypt.hash("correct-horse-battery", 4); // low rounds for speed
  return {
    _id: { toString: () => "507f1f77bcf86cd799439099" } as any,
    name: "Alice",
    email: "alice@example.com",
    password: hashed,
    ...overrides,
  } as unknown as IUser;
};

const buildRepoStub = (overrides: Partial<UserRepository> = {}): UserRepository => {
  // `create` returns an object with a plausible _id so AuthService.register
  // (which now signs a JWT keyed to the newly-created user id) has something
  // to work with.
  const base: Partial<UserRepository> = {
    findByEmail: async () => null,
    findByIdWithPassword: async () => null,
    create: async (data: any) => ({
      _id: { toString: () => "507f1f77bcf86cd799439011" },
      ...data,
    }),
  };
  return { ...base, ...overrides } as UserRepository;
};

test("register: rejects missing fields", async () => {
  const svc = new AuthService(buildRepoStub());
  await assert.rejects(
    svc.register({ name: "", email: "a@b.co", password: "pw" }),
    (e) => e instanceof BadRequestError
  );
});

test("register: rejects duplicate email", async () => {
  const fake = await makeFakeUser();
  const svc = new AuthService(
    buildRepoStub({ findByEmail: async () => fake })
  );
  await assert.rejects(
    svc.register({ name: "Bob", email: "alice@example.com", password: "anything" }),
    (e) => e instanceof ConflictError
  );
});

test("register: hashes password before persisting", async () => {
  let saved: any = null;
  const svc = new AuthService(
    buildRepoStub({
      findByEmail: async () => null,
      create: async (data: any) => {
        saved = data;
        return {
          _id: { toString: () => "507f1f77bcf86cd799439013" },
          ...data,
        };
      },
    })
  );
  await svc.register({ name: "Alice", email: "Alice@Example.com", password: "plainpw" });
  assert.ok(saved);
  assert.equal(saved.email, "alice@example.com", "email is lowercased before persist");
  assert.notEqual(saved.password, "plainpw", "password must not be stored in plain text");
  const ok = await bcrypt.compare("plainpw", saved.password);
  assert.ok(ok, "stored hash must verify against original password");
});

test("login: rejects unknown email with UnauthorizedError", async () => {
  const svc = new AuthService(buildRepoStub());
  await assert.rejects(
    svc.login({ email: "nobody@example.com", password: "x" }),
    (e) => e instanceof UnauthorizedError
  );
});

test("login: rejects wrong password without leaking which credential failed", async () => {
  const fake = await makeFakeUser();
  const svc = new AuthService(
    buildRepoStub({
      findByEmail: async () => fake,
      findByIdWithPassword: async () => fake,
    })
  );
  await assert.rejects(
    svc.login({ email: fake.email, password: "nope" }),
    (e) => e instanceof UnauthorizedError && /Invalid email or password/.test(e.message)
  );
});

test("register: returns token + user so client can skip a /login round-trip", async () => {
  const svc = new AuthService(
    buildRepoStub({
      findByEmail: async () => null,
      create: async (data: any) => ({
        _id: { toString: () => "507f1f77bcf86cd799439012" },
        ...data,
      }),
    })
  );
  const result = await svc.register({
    name: "Alice",
    email: "alice@example.com",
    password: "plainpw",
  });
  assert.ok(result.token, "register must return a token");
  assert.equal(result.user.email, "alice@example.com");
  assert.equal(result.user.id, "507f1f77bcf86cd799439012");
  const payload = jwt.verify(result.token, process.env.JWT_SECRET!) as { userId: string };
  assert.equal(payload.userId, "507f1f77bcf86cd799439012");
});

test("login: returns signed JWT carrying userId on success", async () => {
  const fake = await makeFakeUser();
  const svc = new AuthService(
    buildRepoStub({
      findByEmail: async () => fake,
      findByIdWithPassword: async () => fake,
    })
  );
  const { token, user } = await svc.login({ email: fake.email, password: "correct-horse-battery" });
  assert.ok(token);
  assert.equal(user.email, fake.email);
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  assert.equal(payload.userId, fake._id.toString());
});
