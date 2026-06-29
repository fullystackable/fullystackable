type SupabaseQueryError = {
  code?: string | null;
  message?: string | null;
};

const brandWorkspaceSupportRelations = [
  "public.brand_prompts",
  "public.brand_database_files",
] as const;

function matchesRelationInMessage(message: string, relation: string) {
  const normalizedRelation = relation.toLowerCase();
  const relationName = normalizedRelation.split(".").at(-1) ?? normalizedRelation;

  return (
    message.includes(normalizedRelation) ||
    message.includes(`public.${relationName}`) ||
    message.includes(relationName)
  );
}

export function isMissingSupabaseRelationError(
  error: SupabaseQueryError | null | undefined,
  relations: readonly string[],
) {
  if (!error?.message) {
    return error?.code === "42P01" || error?.code === "PGRST205";
  }

  const message = error.message.toLowerCase();
  const mentionsRelation = relations.some((relation) =>
    matchesRelationInMessage(message, relation),
  );

  if (error.code === "42P01") {
    return mentionsRelation || message.includes("relation");
  }

  if (error.code === "PGRST205") {
    return mentionsRelation || message.includes("schema cache");
  }

  return (
    mentionsRelation &&
    (message.includes("schema cache") ||
      message.includes("could not find the table") ||
      message.includes("relation"))
  );
}

export function isMissingBrandWorkspaceSupportTableError(
  error: SupabaseQueryError | null | undefined,
) {
  return isMissingSupabaseRelationError(error, brandWorkspaceSupportRelations);
}

export function getBrandWorkspaceSupportTablesPendingMessage() {
  return "Prompts and database info are still syncing in Supabase. Refresh in a minute and try again.";
}
