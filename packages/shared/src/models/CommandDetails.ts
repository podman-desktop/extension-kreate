export interface CommandArg {
  name: string;
  label: string;
  description: string;
  required: boolean;
}

export interface CommandOption {
  name: string;
  label: string;
  description: string;
  type: string;
  multiple: boolean;
}

export interface CommandDetails {
  args?: CommandArg[];
  options?: CommandOption[];
}
