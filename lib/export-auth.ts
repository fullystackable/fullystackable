import { timingSafeEqual } from "node:crypto";

const exportUsernameEnvName = "EXPORT_BASIC_AUTH_USERNAME";
const exportPasswordEnvName = "EXPORT_BASIC_AUTH_PASSWORD";

export const exportProtectionEnvVarNames = {
  username: exportUsernameEnvName,
  password: exportPasswordEnvName,
} as const;

type ExportProtectionConfiguredStatus = {
  mode: "configured";
  username: string;
  password: string;
};

type ExportProtectionMissingStatus = {
  mode: "missing";
  message: string;
};

type ExportProtectionMisconfiguredStatus = {
  mode: "misconfigured";
  message: string;
};

export type ExportProtectionStatus =
  | ExportProtectionConfiguredStatus
  | ExportProtectionMissingStatus
  | ExportProtectionMisconfiguredStatus;

function readOptionalEnvValue(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

export function getExportProtectionStatus(): ExportProtectionStatus {
  const username = readOptionalEnvValue(exportUsernameEnvName);
  const password = readOptionalEnvValue(exportPasswordEnvName);

  if (username && password) {
    return {
      mode: "configured",
      username,
      password,
    };
  }

  if (!username && !password) {
    return {
      mode: "missing",
      message: `Set ${exportUsernameEnvName} and ${exportPasswordEnvName} to enable protected backups.`,
    };
  }

  return {
    mode: "misconfigured",
    message: `Backups stay disabled until both ${exportUsernameEnvName} and ${exportPasswordEnvName} are set together.`,
  };
}

function parseBasicAuthorizationHeader(header: string | null) {
  if (!header) {
    return null;
  }

  const [scheme, encodedCredentials] = header.split(" ", 2);

  if (!scheme || !encodedCredentials || scheme.toLowerCase() !== "basic") {
    return null;
  }

  let decodedCredentials: string;

  try {
    decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf8");
  } catch {
    return null;
  }

  const separatorIndex = decodedCredentials.indexOf(":");

  if (separatorIndex < 0) {
    return null;
  }

  return {
    username: decodedCredentials.slice(0, separatorIndex),
    password: decodedCredentials.slice(separatorIndex + 1),
  };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAuthorizedExportRequest(
  authorizationHeader: string | null,
  expectedUsername: string,
  expectedPassword: string,
) {
  const credentials = parseBasicAuthorizationHeader(authorizationHeader);

  if (!credentials) {
    return false;
  }

  return (
    safeEqual(credentials.username, expectedUsername) &&
    safeEqual(credentials.password, expectedPassword)
  );
}
