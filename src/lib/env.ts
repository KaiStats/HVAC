function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

// Public (browser-safe) values.
export const PUBLIC_ENV = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};

// Server-only values. Never import these into client components.
export const SERVER_ENV = {
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicApiKey: () => required("ANTHROPIC_API_KEY"),
  anthropicQaModel: () =>
    optional("ANTHROPIC_QA_MODEL", "claude-3-5-haiku-latest"),
  voyageApiKey: () => required("VOYAGE_API_KEY"),
  voyageEmbedModel: () => optional("VOYAGE_EMBED_MODEL", "voyage-3.5-lite"),
  voyageRerankModel: () => optional("VOYAGE_RERANK_MODEL", "rerank-2.5-lite"),
};

export const EMBEDDING_DIMENSIONS = 1024;
