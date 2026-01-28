#!/usr/bin/env bash
set -euo pipefail

# Simple Postgres backup using pg_dump. Works on Windows bash (Git Bash) too.
# Usage examples:
#   ./scripts/backup_postgres.sh \
#     --url "jdbc:postgresql://host:5432/dbname?sslmode=require" \
#     --user "db_user" \
#     --password "db_password"
# Or provide env vars: PG_URL, PG_USER, PG_PASSWORD
# Output: backups to ./backups/<dbname>_<timestamp>.sql

print_help() {
  cat <<'EOF'
Backup Postgres database (pg_dump)

Flags:
  --url <jdbc/pg URL>       JDBC or postgres URL (e.g. jdbc:postgresql://host:5432/db?sslmode=require
                            or postgres://user:pass@host:5432/db?sslmode=require)
  --user <username>         Database username
  --password <password>     Database password (or use env PG_PASSWORD)
  --format <plain|custom>   pg_dump format (default: plain)

Env vars:
  PG_URL, PG_USER, PG_PASSWORD

Examples:
  ./scripts/backup_postgres.sh --url "jdbc:postgresql://ep...:5432/neondb?sslmode=require" --user neondb_owner --password ******
  ./scripts/backup_postgres.sh # uses PG_URL/PG_USER/PG_PASSWORD
EOF
}

URL=${PG_URL:-}
USER=${PG_USER:-}
PASSWORD=${PG_PASSWORD:-}
FORMAT="plain"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      URL="$2"; shift 2;;
    --user)
      USER="$2"; shift 2;;
    --password)
      PASSWORD="$2"; shift 2;;
    --format)
      FORMAT="$2"; shift 2;;
    -h|--help)
      print_help; exit 0;;
    *)
      echo "Unknown arg: $1"; print_help; exit 1;;
  esac
done

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Error: pg_dump not found. Install PostgreSQL client tools and ensure pg_dump is in PATH." >&2
  exit 1
fi

if [[ -z "$URL" || -z "$USER" || -z "$PASSWORD" ]]; then
  echo "Error: missing URL/USER/PASSWORD. Use flags or PG_URL/PG_USER/PG_PASSWORD." >&2
  print_help
  exit 1
fi

# Convert JDBC URL to postgres URL if needed
# jdbc:postgresql://host:port/db?params -> postgres://host:port/db?params
if [[ "$URL" == jdbc:postgresql://* ]]; then
  URL="postgres://${URL#jdbc:postgresql://}"
fi

# Extract database name for filename
DB_NAME="unknown"
# shellcheck disable=SC2001
DB_NAME=$(echo "$URL" | sed -E 's|.*://[^/]+/([^?]+).*|\1|')
TS=$(date +%Y%m%d_%H%M%S)
mkdir -p backups
OUT_FILE="backups/${DB_NAME}_${TS}.sql"

# Use PGPASSWORD for authentication; pg_dump supports full connection string
export PGPASSWORD="$PASSWORD"

# For neon sslmode=require, pass --dbname as URL; pg_dump handles parameters
if [[ "$FORMAT" == "custom" ]]; then
  pg_dump --format=custom --no-owner --no-privileges --dbname="$URL" --username="$USER" --file "$OUT_FILE"
else
  pg_dump --format=plain --no-owner --no-privileges --dbname="$URL" --username="$USER" --file "$OUT_FILE"
fi

unset PGPASSWORD

echo "Backup complete: $OUT_FILE"