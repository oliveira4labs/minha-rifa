export interface Migration {
  up: string;
  down: string;
}

export interface LoadedMigration extends Migration {
  id: string;
}

export interface AppliedMigrationRow {
  id: string;
  applied_at: Date;
}

export interface MigrationStatus {
  id: string;
  appliedAt: Date | null;
  missingFile: boolean;
}

export type MigrationLogger = (message: string) => void;
