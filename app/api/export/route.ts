import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getExportProtectionStatus,
  isAuthorizedExportRequest,
} from "@/lib/export-auth";

export const dynamic = "force-dynamic";

const protectedResponseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Authorization",
};

async function loadTable(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  orderBy = "created_at",
) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy, { ascending: true });

  if (error) {
    throw new Error(`Failed to export ${table}: ${error.message}`);
  }

  return data ?? [];
}

export async function GET(request: Request) {
  const exportProtection = getExportProtectionStatus();

  if (exportProtection.mode !== "configured") {
    return new Response(exportProtection.message, {
      status: 503,
      headers: protectedResponseHeaders,
    });
  }

  if (
    !isAuthorizedExportRequest(
      request.headers.get("authorization"),
      exportProtection.username,
      exportProtection.password,
    )
  ) {
    return new Response("Backup credentials required.", {
      status: 401,
      headers: {
        ...protectedResponseHeaders,
        "WWW-Authenticate": 'Basic realm="fullystackable backup", charset="UTF-8"',
      },
    });
  }

  const exportedAt = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const [
    brands,
    campaigns,
    tasks,
    contacts,
    assets,
    upcomingItems,
    notes,
    activityLog,
  ] = await Promise.all([
    loadTable(supabase, "brands", "name"),
    loadTable(supabase, "campaigns"),
    loadTable(supabase, "tasks"),
    loadTable(supabase, "contacts", "name"),
    loadTable(supabase, "assets", "updated_at"),
    loadTable(supabase, "upcoming_items", "date"),
    loadTable(supabase, "notes"),
    loadTable(supabase, "activity_log"),
  ]);

  const fileDate = exportedAt.slice(0, 10);
  const body = JSON.stringify(
    {
      meta: {
        app: "fullystackable",
        exportedAt,
        version: 1,
      },
      brands,
      campaigns,
      tasks,
      contacts,
      assets,
      upcomingItems,
      notes,
      activityLog,
    },
    null,
    2,
  );

  return new Response(body, {
    headers: {
      ...protectedResponseHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="fullystackable-export-${fileDate}.json"`,
    },
  });
}
