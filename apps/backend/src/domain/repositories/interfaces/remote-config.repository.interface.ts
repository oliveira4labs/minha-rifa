import type { RemoteConfigEntry } from '../../interfaces/remote-config.interface.js';

export interface IRemoteConfigRepository {
  get(key: string): Promise<string | null>;
  listPublic(): Promise<RemoteConfigEntry[]>;
}
