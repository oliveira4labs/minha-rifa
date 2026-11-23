import type { RemoteConfigEntry } from '../../interfaces/remote-config.interface.js';

export interface IRemoteConfigRepository {
  listPublic(): Promise<RemoteConfigEntry[]>;
}
