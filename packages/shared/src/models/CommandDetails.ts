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

export interface CommandDetails {
  name: string;
  args?: CommandArg[];
  options?: CommandOption[];
  commands?: CommandDetails[];
  cli?: string[];
}
