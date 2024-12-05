export interface CommandArg {
  name: string;
  label: string;
  description: string;
  required: boolean;
}

export interface CommandOption {
  flag: string;
  label: string;
  description: string;
  type: string;
  multiple: boolean;
  repeatFlag?: boolean;
}

export interface CommandOptionBoolean extends CommandOption {
  type: 'boolean';
  default: boolean;
}

export function isCommandOptionBoolean(co: CommandOption): co is CommandOptionBoolean {
  return co.type === 'boolean';
}

export interface CommandOptionNumber extends CommandOption {
  type: 'number';
  default: number;
}

export function isCommandOptionNumber(co: CommandOption): co is CommandOptionNumber {
  return co.type === 'number';
}

export interface CommandDetails {
  name: string;
  args?: CommandArg[];
  options?: CommandOption[];
  commands?: CommandDetails[];
  cli?: string[];
}
