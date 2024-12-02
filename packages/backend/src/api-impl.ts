import * as podmanDesktopApi from '@podman-desktop/api';
import type { KreateApi } from '../../shared/src/KreateApi';
import commands from './assets/commands.json';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';
/**
 * HelloWorldApi is an interface that defines the abstracted class for the HelloWorldApi, it is a requirement to match this interface to your API implementation.
 *
 * The below code can be used with the podmanDesktopApi to showcase the usage of the API, as well as any other "backend" code that you may want to run.
 */
export class KreateApiImpl implements KreateApi {
  constructor(private readonly extensionContext: podmanDesktopApi.ExtensionContext) {}

  async getCommands(parent?: string): Promise<string[]> {
    if (!parent) {
      return commands.commands.map(c => c.name);
    }
    const parentCommand = commands.commands.find(c => c.name === parent);
    if (!parentCommand) {
      throw new Error(`parent command ${parent[0]} not found`);
    }
    return parentCommand.commands?.map(c => c.name) ?? [];
  }

  async getCommandDetails(command: string[]): Promise<CommandDetails> {
    for (const name of command) {
      const command = commands.commands.find(c => c.name === name);
      if (!command) {
        throw new Error('command not found');
      }
      if (!command.commands) {
        return command;
      }
    }
    throw new Error('command not found');
  }

  async executeCommand(args: string[]): Promise<string> {
    const result = await podmanDesktopApi.process.exec('kubectl', args.concat(['--dry-run', '-o', 'yaml']));
    return result.stdout;
  }
}
