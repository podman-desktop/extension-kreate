import type { CommandDetails } from './models/CommandDetails';
import type * as podmanDesktopApi from '@podman-desktop/api';

export abstract class KreateApi {
  abstract getCommands(parent?: string): Promise<string[]>;
  abstract getCommandDetails(command: string[]): Promise<CommandDetails>;
  abstract executeCommand(args: string[]): Promise<string>;

  abstract openDialog(options?: podmanDesktopApi.OpenDialogOptions): Promise<podmanDesktopApi.Uri[] | undefined>;

  abstract create(s: string): Promise<void>;
}
