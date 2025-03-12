/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

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
