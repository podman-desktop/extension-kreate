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

import { beforeEach, expect, test, vi } from 'vitest';
import { type Index, SpecReader } from './spec-reader';
import type { KubeConfig } from '@kubernetes/client-node';
import index from '../tests/openapi-dump/index.json';
import appsv1 from '../tests/openapi-dump/openapi/v3/apis/apps/v1.json';

import { type OpenAPIV3 } from 'openapi-types';
import fetch, { type Response } from 'node-fetch';

vi.mock('@kubernetes/client-node');
vi.mock('node-fetch');

let specReader: TestSpecReader;

class TestSpecReader extends SpecReader {
  public async getIndex(): Promise<Index> {
    return super.getIndex();
  }

  public async getGroupVersionSpec(
    apiVersion: string,
    kind: string,
  ): Promise<OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> {
    return super.getGroupVersionSpec(apiVersion, kind);
  }
}

beforeEach(() => {
  const kubeconfig = {
    getCurrentCluster: vi.fn(),
    applyToFetchOptions: vi.fn(),
  } as unknown as KubeConfig;
  vi.mocked(kubeconfig.getCurrentCluster).mockReturnValue({
    name: 'mycluster',
    server: 'https://localhost:10001',
    skipTLSVerify: false,
  });
  vi.mocked(kubeconfig.applyToFetchOptions).mockResolvedValue({});
  specReader = new TestSpecReader(kubeconfig);
  vi.spyOn(specReader, 'getIndex').mockResolvedValue(index);
});

test('getGroupVersionSpec', async () => {
  const fetchResult = {
    json: vi.fn(),
  } as unknown as Response;
  vi.mocked(fetchResult.json).mockResolvedValue(appsv1);
  vi.mocked(fetch).mockResolvedValue(fetchResult);
  const res = await specReader.getGroupVersionSpec('apps/v1', 'Deployment');
  expect(res).toHaveProperty('description', 'Deployment enables declarative updates for Pods and ReplicaSets.');
});

test('getSpecFromYamlManifest', async () => {
  vi.spyOn(specReader, 'getGroupVersionSpec');
  await specReader.getSpecFromYamlManifest('apiVersion: apps/v1\nkind: Deployment\n');
  expect(specReader.getGroupVersionSpec).toHaveBeenCalledWith('apps/v1', 'Deployment');
});

test('getPathAtPosition', async () => {
  const deploy1 = `
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: dep1
  name: dep1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dep1
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: dep1
    spec:
      containers:
      - image: img
        name: img
        resources: {}
status: {}`;
  const paths = [
    [],
    [''],
    ['kind'],
    ['metadata'],
    ['metadata', 'creationTimestamp'],
    ['metadata', 'labels'],
    ['metadata', 'labels', 'app'],
    ['metadata', 'name'],
    ['spec'],
    ['spec', 'replicas'],
    ['spec', 'selector'],
    ['spec', 'selector', 'matchLabels'],
    ['spec', 'selector', 'matchLabels', 'app'],
    ['spec', 'strategy'],
    ['spec', 'template'],
    ['spec', 'template', 'metadata'],
    ['spec', 'template', 'metadata', 'creationTimestamp'],
    ['spec', 'template', 'metadata', 'labels'],
    ['spec', 'template', 'metadata', 'labels', 'app'],
    ['spec', 'template', 'spec'],
    ['spec', 'template', 'spec', 'containers'],
    ['spec', 'template', 'spec', 'containers', '0', 'image'],
    ['spec', 'template', 'spec', 'containers', '0', 'name'],
    ['spec', 'template', 'spec', 'containers', '0', 'resources'],
    ['status'],
  ];
  for (let i = 0; i < paths.length; i++) {
    expect(await specReader.getPathAtPosition(deploy1, i)).toEqual(paths[i]);
  }
});
