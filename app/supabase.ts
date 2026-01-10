
const SUPABASE_URL = "https://xrzgniwdagwvcygqerjd.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyemduaXdkYWd3dmN5Z3FlcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTE0NDYsImV4cCI6MjA4MTU2NzQ0Nn0.O7obWlRudDfHg07hzuEAAY6H1G1br0ht6_zfeHam_Tg";


export async function supabaseFetch(
  table: string,
  options: RequestInit & { query?: string } = {}
): Promise<any> {
  const { query = "", ...fetchOpts } = options;
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      "Content-Type": "application/json",
      ...(fetchOpts.headers || {}),
    },
    ...fetchOpts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error: ${res.status} ${res.statusText} - ${text}`);
  }
  // Attempt to parse JSON, but fall back to text if parsing fails.
  try {
    return await res.json();
  } catch {
    return await res.text();
  }
}

// Fetch all rows from a table.  Pass a select expression if you only
// need certain columns.  This helper returns an array of objects.
export async function fetchTable<T = any>(
  table: string,
  select: string = "*"
): Promise<T[]> {
  
  const encoded = select === "*" ? "*" : encodeURIComponent(select);
  return await supabaseFetch(table, { query: `select=${encoded}` });
}

// Insert a single row into a table.  The body should be a plain JS
// object.  Supabase will return the inserted row on success.
export async function insertRow(table: string, row: any) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    }
  );

  // 👉 LER O BODY UMA ÚNICA VEZ
  let responseBody: any = null;
  const text = await response.text();
  if (text) {
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof responseBody === "string"
        ? responseBody
        : JSON.stringify(responseBody)
    );
  }

  return responseBody;
}


// Update rows in a table matching the specified filter.  Filters use
// PostgREST syntax, e.g. `id=eq.123`.  The body should contain
// the fields to update.  Returns the updated rows.
export async function updateRows<T = any>(
  table: string,
  filter: string,
  body: Partial<T>
): Promise<T[]> {
  return await supabaseFetch(table, {
    method: "PATCH",
    query: filter,
    body: JSON.stringify(body),
  });
}

// Delete rows in a table matching the specified filter.  Returns the
// deleted rows.  Use with caution because deletions are permanent.
export async function deleteRow(
  table: string,
  column: string,
  value: string
) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        Prefer: "return=minimal",
      },
    }
  );

  // ⚠️ DELETE normalmente NÃO devolve body
  if (!response.ok) {
    const text = await response.text(); // só lemos UMA vez
    throw new Error(text || "Erro ao remover registo");
  }

  return true;
}

export async function deleteRows(table: string, filter: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      Prefer: "return=minimal",
    },
  });

  if (!response.ok) {
    const text = await response.text(); // lê uma vez
    throw new Error(text || "Erro ao remover registo");
  }

  return true;
}
