import { KubeConfig, KubernetesObject } from '@kubernetes/client-node';
import { validate } from '@scalar/openapi-parser';
import fetch from 'node-fetch';
import { OpenAPIV3 } from 'openapi-types';
import { parseAllDocuments } from 'yaml';
import { SourceMap } from './yaml-mapper';
import yaml from "js-yaml";

export interface Index {
  paths: IndexPaths;
}

export interface IndexPaths {
  [api: string]: IndexApi;
}

export interface IndexApi {
  serverRelativeURL: string;
}

export class SpecReader {
  #kubeconfig: KubeConfig;
  #index: Index | undefined;

  constructor(kubeconfig: KubeConfig) {
    this.#kubeconfig = kubeconfig;
  }


  public async getSpecFromYamlManifest(content: string): Promise<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> {
    const manifests = parseAllDocuments(content, { customTags: this.getTags }).map(manifest => manifest.toJSON()).filter(manifest => !!manifest);
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
    return this.getGroupVersionSpec(
      this.getGroupVersionFromApiVersion(manifest.apiVersion), 
      `${this.getSchemaPrefixFromApiVersion(manifest.apiVersion)}.${manifest.kind}`,
    );
  }
  
  public async getPathAtPosition(content: string, position: number): Promise<string[]> {
    const map = new SourceMap();
    yaml.load(content, { listener: map.listen() });
    const path = map.getAtPos(position);
    if (path) {
      return (path as string).split('.').slice(1);
    }
    return [];
  }

  private async getIndex(): Promise<Index> {
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

  private async getGroupVersionSpec(groupVersion: string, resource: string): Promise<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> {
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
    if (!document.components?.schemas?.[resource]) {
      throw new Error(`schema not found for ${resource} in ${groupVersion}`);
    }
    return document.components.schemas[resource];
  }

  private getGroupVersionFromApiVersion(apiVersion: string): string {
    switch (apiVersion) {
      case 'v1':
        return 'api/v1';
      default:
        return `apis/${apiVersion}`;
    }
  }

  private getSchemaPrefixFromApiVersion(apiVersion: string): string {
    switch (apiVersion) {
      case 'v1':
        return 'io.k8s.api.core.v1';
      default:
        return `io.k8s.api.${apiVersion.replace('.k8s.io', '').replace('/', '.')}`;
    }
  }

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
}
