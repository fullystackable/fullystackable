import { afterEach, describe, expect, it } from "vitest";

import {
  getExportProtectionStatus,
  isAuthorizedExportRequest,
} from "@/lib/export-auth";

const originalUsername = process.env.EXPORT_BASIC_AUTH_USERNAME;
const originalPassword = process.env.EXPORT_BASIC_AUTH_PASSWORD;

function buildBasicAuthHeader(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

afterEach(() => {
  if (originalUsername === undefined) {
    delete process.env.EXPORT_BASIC_AUTH_USERNAME;
  } else {
    process.env.EXPORT_BASIC_AUTH_USERNAME = originalUsername;
  }

  if (originalPassword === undefined) {
    delete process.env.EXPORT_BASIC_AUTH_PASSWORD;
  } else {
    process.env.EXPORT_BASIC_AUTH_PASSWORD = originalPassword;
  }
});

describe("getExportProtectionStatus", () => {
  it("reports a configured state when both env vars exist", () => {
    process.env.EXPORT_BASIC_AUTH_USERNAME = "backup";
    process.env.EXPORT_BASIC_AUTH_PASSWORD = "secret-passphrase";

    expect(getExportProtectionStatus()).toMatchObject({
      mode: "configured",
      username: "backup",
      password: "secret-passphrase",
    });
  });

  it("fails closed when the credentials are missing", () => {
    delete process.env.EXPORT_BASIC_AUTH_USERNAME;
    delete process.env.EXPORT_BASIC_AUTH_PASSWORD;

    expect(getExportProtectionStatus()).toMatchObject({
      mode: "missing",
    });
  });

  it("fails closed when only one credential is configured", () => {
    process.env.EXPORT_BASIC_AUTH_USERNAME = "backup";
    delete process.env.EXPORT_BASIC_AUTH_PASSWORD;

    expect(getExportProtectionStatus()).toMatchObject({
      mode: "misconfigured",
    });
  });
});

describe("isAuthorizedExportRequest", () => {
  it("accepts a matching HTTP Basic auth header", () => {
    expect(
      isAuthorizedExportRequest(
        buildBasicAuthHeader("backup", "secret-passphrase"),
        "backup",
        "secret-passphrase",
      ),
    ).toBe(true);
  });

  it("rejects missing or incorrect credentials", () => {
    expect(
      isAuthorizedExportRequest(null, "backup", "secret-passphrase"),
    ).toBe(false);
    expect(
      isAuthorizedExportRequest(
        buildBasicAuthHeader("backup", "wrong-passphrase"),
        "backup",
        "secret-passphrase",
      ),
    ).toBe(false);
  });
});
