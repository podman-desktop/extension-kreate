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

import type { CommandDetails } from './models/CommandDetails';
import type * as podmanDesktopApi from '@podman-desktop/api';
import type { SimplifiedSpec } from './models/SimplifiedSpec';

export const NO_CONTEXT_EXCEPTION = 'No current context';
export const NO_OPENAPI_EXCEPTION = 'No openapi endpoint';

export abstract class KreateApi {
  abstract getCommands(parent?: string): Promise<string[]>;
  abstract getCommandDetails(command: string[]): Promise<CommandDetails>;
  abstract executeCommand(args: string[]): Promise<string>;

  abstract openDialog(options?: podmanDesktopApi.OpenDialogOptions): Promise<podmanDesktopApi.Uri[] | undefined>;

  abstract create(s: string): Promise<void>;

  abstract getSpecFromYamlManifest(content: string, pathInSpec: string[]): Promise<SimplifiedSpec>;
  abstract getPathAtPosition(content: string, position: number): Promise<string[]>;
  abstract getState(): Promise<{ content: string; position: number }>;
}
