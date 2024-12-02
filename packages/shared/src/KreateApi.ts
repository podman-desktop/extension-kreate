import type { CommandDetails } from './models/CommandDetails';

export abstract class KreateApi {
  abstract getCommands(parent?: string): Promise<string[]>;

  abstract getCommandDetails(command: string[]): Promise<CommandDetails>;

  abstract executeCommand(args: string[]): Promise<string>;
}
