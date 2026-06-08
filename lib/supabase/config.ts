function readEnvValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function assertSupabaseUrl(value: string, envName: string) {
  if (value.startsWith("sb_")) {
    throw new Error(
      `${envName} looks like a Supabase key. Expected the project URL, such as https://your-project-ref.supabase.co.`,
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(
      `${envName} must be a valid URL, such as https://your-project-ref.supabase.co.`,
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`${envName} must use http or https.`);
  }
}

function assertPublicKey(value: string, envName: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    throw new Error(
      `${envName} looks like a URL. Expected a Supabase publishable or anon key.`,
    );
  }

  if (value.startsWith("sb_secret_")) {
    throw new Error(
      `${envName} contains a secret key. Use a browser-safe publishable key instead.`,
    );
  }
}

function assertServerKey(value: string, envName: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    throw new Error(
      `${envName} looks like a URL. Expected a server-only Supabase secret or service-role key.`,
    );
  }

  if (value.startsWith("sb_publishable_")) {
    throw new Error(
      `${envName} contains a publishable key. Use a server-only secret or service-role key instead.`,
    );
  }
}

export function getSupabasePublicConfig() {
  const url = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!publishableKey) {
    throw new Error(
      "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  assertSupabaseUrl(url, "NEXT_PUBLIC_SUPABASE_URL");
  assertPublicKey(
    publishableKey,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );

  return {
    url,
    publishableKey,
  };
}

export function getSupabaseServerKey() {
  const serverKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serverKey) {
    throw new Error(
      "Missing Supabase server key. Set SUPABASE_SECRET_KEY or the legacy SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  assertServerKey(
    serverKey,
    process.env.SUPABASE_SECRET_KEY
      ? "SUPABASE_SECRET_KEY"
      : "SUPABASE_SERVICE_ROLE_KEY",
  );

  return serverKey;
}
