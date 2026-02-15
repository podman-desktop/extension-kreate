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

import * as podmanDesktopApi from '@podman-desktop/api';
import type { KreateApi, Resource } from '/@shared/src/KreateApi';
import commands from './assets/commands.json';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';
import type { KubernetesObject, V1APIResourceList } from '@kubernetes/client-node';
import { ApisApi, KubeConfig } from '@kubernetes/client-node';
import { parseAllDocuments } from 'yaml';
import { SpecReader } from './spec-reader';
import type { SimplifiedSpec } from '/@shared/src/models/SimplifiedSpec';
import { getSimplifiedSpec, getSubspec } from './simplified-spec';
import fetch from 'node-fetch';

/**
 * HelloWorldApi is an interface that defines the abstracted class for the HelloWorldApi, it is a requirement to match this interface to your API implementation.
 *
 * The below code can be used with the podmanDesktopApi to showcase the usage of the API, as well as any other "backend" code that you may want to run.
 */
export class KreateApiImpl implements KreateApi, podmanDesktopApi.Disposable {
  #specReader: SpecReader;

  constructor(private readonly extensionContext: podmanDesktopApi.ExtensionContext) {
    this.#specReader = new SpecReader();
  }

  init(): void {
    this.#specReader.init();
  }

  async getCommands(parent?: string): Promise<string[]> {
    if (!parent) {
      return commands.commands.map(c => c.name);
    }
    const parentCommand = commands.commands.find(c => c.name === parent);
    if (!parentCommand) {
      throw new Error(`parent command ${parent} not found`);
    }
    return parentCommand.commands?.map(c => c.name) ?? [];
  }

  async getCommandDetails(command: string[]): Promise<CommandDetails> {
    let searchCommands: CommandDetails[] = commands.commands;
    for (const name of command) {
      const cmd = searchCommands.find(c => c.name === name);
      if (!cmd) {
        throw new Error('command not found');
      }
      if (!cmd.commands) {
        return cmd;
      }
      searchCommands = cmd.commands;
    }
    throw new Error('command not found');
  }

  async executeCommand(args: string[]): Promise<string> {
    let result: podmanDesktopApi.RunResult;
    try {
      result = await podmanDesktopApi.process.exec(args[0], args.slice(1));
      return result.stdout;
    } catch (err: unknown) {
      const runErr = err as podmanDesktopApi.RunError;
      throw runErr.stderr;
    }
  }

  async openDialog(options?: podmanDesktopApi.OpenDialogOptions): Promise<podmanDesktopApi.Uri[] | undefined> {
    return await podmanDesktopApi.window.showOpenDialog(options);
  }

  async create(s: string): Promise<void> {
    const file = podmanDesktopApi.kubernetes.getKubeconfig();
    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromFile(file.path);
    const context = kubeConfig.currentContext;

    const manifests = await this.loadManifestsFromFile(s);
    if (manifests.filter(s => s?.kind).length === 0) {
      throw new Error('No valid Kubernetes resources found in content');
    }
    await podmanDesktopApi.kubernetes.createResources(context, manifests);
  }

  public async getSpecFromYamlManifest(content: string, pathInSpec: string[]): Promise<SimplifiedSpec> {
    const result = await this.#specReader.getSpecFromYamlManifest(content);

    return getSubspec(getSimplifiedSpec(result.spec, result.kind), { pathInSpec, maxDepth: 2 });
  }

  public async getPathAtPosition(content: string, position: number): Promise<string[]> {
    return this.#specReader.getPathAtPosition(content, position);
  }

  public async getState(): Promise<{ content: string; position: number }> {
    return this.#specReader.getState();
  }

  private async loadManifestsFromFile(content: string): Promise<KubernetesObject[]> {
    const manifests = parseAllDocuments(content, { customTags: this.getTags });
    // filter out null manifests
    return manifests.map(manifest => manifest.toJSON()).filter(manifest => !!manifest);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getTags(tags: any[]): any[] {
    for (const tag of tags) {
      if (tag.tag === 'tag:yaml.org,2002:int') {
        const newTag = { ...tag };
        newTag.test = /^(0[0-7][0-7][0-7])$/;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newTag.resolve = (str: any): number => parseInt(str, 8);
        tags.unshift(newTag);
        break;
      }
    }
    return tags;
  }

  dispose(): void {
    this.#specReader?.dispose();
  }

  public async fetchAllResources(): Promise<Resource[]> {
    const file = podmanDesktopApi.kubernetes.getKubeconfig();
    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromFile(file.path);
    const result = await kubeConfig.makeApiClient(ApisApi).getAPIVersions();
    const resourcesResult: Resource[] = [];
    for (const group of [
      'v1',
      ...result.groups
        .map(g => g.preferredVersion?.groupVersion)
        .filter(g => g !== undefined)
        .sort((a, b) => a.localeCompare(b)),
    ]) {
      const resources = await this.getApiResources(kubeConfig, group);
      if (resources?.resources) {
        resourcesResult.push(
          ...resources.resources
            .filter(r => r.singularName)
            .sort((a, b) => a.kind.localeCompare(b.kind))
            .map(r => {
              return {
                apiVersion: resources.groupVersion,
                kind: r.kind,
              };
            }),
        );
      }
    }
    return resourcesResult;
  }

  protected async getApiResources(kc: KubeConfig, groupVersion: string): Promise<V1APIResourceList> {
    let path: string;
    if (groupVersion === 'v1') {
      path = '/api/v1';
    } else {
      path = `/apis/${groupVersion}`;
    }
    const cluster = kc.getCurrentCluster();
    if (!cluster) {
      throw new Error('no current cluster');
    }
    const requestURL = new URL(cluster.server + path);
    const requestInit = await kc.applyToFetchOptions({});
    requestInit.method = 'GET';
    const response = await fetch(requestURL.toString(), requestInit);
    const json = await response.json();
    return json as V1APIResourceList;
  }
}
