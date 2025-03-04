import type { KubeConfig, KubernetesObject } from '@kubernetes/client-node';
import { validate } from '@scalar/openapi-parser';
import fetch from 'node-fetch';
import type { OpenAPIV3 } from 'openapi-types';
import { parseAllDocuments } from 'yaml';
import { SourceMap } from './yaml-mapper';
import yaml from 'js-yaml';

export interface Index {
  paths: IndexPaths;
}

export interface IndexPaths {
  [api: string]: IndexApi;
}

export interface IndexApi {
  serverRelativeURL: string;
}

interface State {
  content: string;
  position: number;
}

export class SpecReader {
  #kubeconfig: KubeConfig;
  #index: Index | undefined;
  #state: State;

  constructor(kubeconfig: KubeConfig) {
    this.#kubeconfig = kubeconfig;
    this.#state = { content: '', position: 0 };
  }

  public async getSpecFromYamlManifest(content: string): Promise<{
    kind: string;
    spec: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
  }> {
    const manifests = parseAllDocuments(content, { customTags: this.getTags })
      .map(manifest => manifest.toJSON())
      .filter(manifest => !!manifest);
    if (manifests.length < 1) {
      throw new Error('no manifest found');
    }
    const manifest = manifests[0] as KubernetesObject;
    if (!manifest.apiVersion) {
      throw new Error('apiVersion not defined in the manifest');
    }
    if (!manifest.kind) {
      throw new Error('kind not defined in the manifest');
    }
    return {
      kind: manifest.kind,
      spec: await this.getGroupVersionSpec(manifest.apiVersion, manifest.kind),
    };
  }

  public async getPathAtPosition(content: string, position: number): Promise<string[]> {
    this.#state = { content, position };
    const map = new SourceMap();
    yaml.load(content, { listener: map.listen() });
    const path = map.getAtPos(position);
    if (path) {
      return (path as string).split('.').slice(1);
    }
    return [];
  }

  public async getState(): Promise<{ content: string; position: number }> {
    return this.#state;
  }

  protected async getIndex(): Promise<Index> {
    if (this.#index) {
      return this.#index;
    }

    const path = '/openapi/v3';
    const cluster = this.#kubeconfig.getCurrentCluster();
    if (!cluster) {
      throw new Error('No currently active cluster');
    }
    const requestURL = new URL(cluster.server + path);
    const requestInit = await this.#kubeconfig.applyToFetchOptions({});
    requestInit.method = 'GET';
    const response = await fetch(requestURL.toString(), requestInit);
    this.#index = await response.json();
    if (!this.#index) {
      throw new Error('index is undefined');
    }
    return this.#index;
  }

  protected async getGroupVersionSpec(
    apiVersion: string,
    kind: string,
  ): Promise<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> {
    const groupVersion = this.getGroupVersionFromApiVersion(apiVersion);
    const index = await this.getIndex();
    const path = index.paths[groupVersion].serverRelativeURL;
    const cluster = this.#kubeconfig.getCurrentCluster();
    if (!cluster) {
      throw new Error('No currently active cluster');
    }
    const requestURL = new URL(cluster.server + path);
    const requestInit = await this.#kubeconfig.applyToFetchOptions({});
    requestInit.method = 'GET';
    const response = await fetch(requestURL.toString(), requestInit);
    const spec = await response.json();
    const result = await validate(spec);
    if (!result.valid) {
      throw new Error(`invalid spec for ${groupVersion}`);
    }
    const document: OpenAPIV3.Document = result.schema;
    if (!document.components?.schemas) {
      throw new Error('no schemas found in spec');
    }
    const resource = this.getSchemedResource(document.components.schemas, apiVersion, kind);
    return document.components.schemas[resource];
  }

  protected getSchemedResource(
    schemas: {
      [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    },
    apiVersion: string,
    kind: string,
  ): string {
    const [group, version] = this.getGroupAndVersion(apiVersion);
    for (const [k, v] of Object.entries(schemas)) {
      if (
        'x-kubernetes-group-version-kind' in v &&
        Array.isArray(v['x-kubernetes-group-version-kind']) &&
        v['x-kubernetes-group-version-kind'].length > 0
      ) {
        const gvk = v['x-kubernetes-group-version-kind'][0];
        if (this.isGroupVersionKind(gvk) && gvk.group === group && gvk.version === version && gvk.kind === kind) {
          return k;
        }
      }
    }
    throw new Error(`no resource found for apiVersion ${apiVersion} and kind ${kind}`);
  }

  protected getGroupAndVersion(apiVersion: string): string[] {
    if (apiVersion.includes('/')) {
      return apiVersion.split('/');
    }
    return ['', apiVersion];
  }

  protected isGroupVersionKind(v: unknown): v is { group: string; version: string; kind: string } {
    return !!v && typeof v === 'object' && 'group' in v && 'version' in v && 'kind' in v;
  }

  protected getGroupVersionFromApiVersion(apiVersion: string): string {
    switch (apiVersion) {
      case 'v1':
        return 'api/v1';
      default:
        return `apis/${apiVersion}`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getTags(tags: any[]): any[] {
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
}
