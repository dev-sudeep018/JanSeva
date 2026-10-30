import test from "node:test";
import assert from "node:assert/strict";
import { testing } from "../worker/index.js";

const valid = {
  subject: "Streetlight is not working",
  category: "Street Lighting",
  area: "Madhapur",
  description: "The streetlight near the community centre has been dark for three nights.",
  name: "Citizen",
  contact: "+91 98765 43210",
  website: ""
};

test("accepts and normalizes a valid grievance", () => {
  const result = testing.validateGrievance(valid);
  assert.equal(result.error, undefined);
  assert.equal(result.grievance.subject, valid.subject);
  assert.equal(result.grievance.website, undefined);
});

test("rejects unsupported categories and bot honeypot submissions", () => {
  assert.match(testing.validateGrievance({ ...valid, category: "Unknown" }).error, /category/i);
  assert.match(testing.validateGrievance({ ...valid, website: "spam.example" }).error, /unable/i);
});

test("detects urgent cases", () => {
  assert.equal(testing.priorityFor({ subject: "Exposed wire", description: "Public danger" }), "High");
  assert.equal(testing.priorityFor({ subject: "Streetlight out", description: "Lamp is dark" }), "Normal");
});

test("signed sessions validate and reject tampering", async () => {
  const env = { SESSION_SECRET: "unit-test-session-secret-that-is-long" };
  const session = await testing.createSession(env.SESSION_SECRET);
  const request = new Request("https://janseva.test/api/admin/session", { headers: { Cookie: `janseva_admin=${session}` } });
  assert.equal(await testing.isAdmin(request, env), true);
  const tampered = new Request("https://janseva.test/api/admin/session", { headers: { Cookie: `janseva_admin=${session}x` } });
  assert.equal(await testing.isAdmin(tampered, env), false);
});

test("constant-time comparison returns the expected result", async () => {
  assert.equal(await testing.safeEqual("correct", "correct"), true);
  assert.equal(await testing.safeEqual("correct", "incorrect"), false);
});
