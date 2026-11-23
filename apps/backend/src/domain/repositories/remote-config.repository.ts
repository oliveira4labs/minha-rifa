import type { RemoteConfigEntry } from '../interfaces/remote-config.interface.js';
import type { IRemoteConfigRepository } from './interfaces/remote-config.repository.interface.js';

export abstract class RemoteConfigRepository implements IRemoteConfigRepository {
  abstract listPublic(): Promise<RemoteConfigEntry[]>;
}
