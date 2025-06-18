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
import { SpecReader } from './spec-reader';
import { KubeConfig } from '@kubernetes/client-node';
import index from '../tests/openapi-dump/index.json';
import appsv1 from '../tests/openapi-dump/openapi/v3/apis/apps/v1.json';

import fetch, { type Response } from 'node-fetch';
import * as podmanDesktopApi from '@podman-desktop/api';
import { SpecCache } from './spec-cache';
import { existsSync } from 'node:fs';

vi.mock('@kubernetes/client-node');
vi.mock('node-fetch');
vi.mock('@podman-desktop/api');
vi.mock('./spec-cache');
vi.mock('node:fs');

let specReader: SpecReader;

beforeEach(() => {
  KubeConfig.prototype.getCurrentCluster = vi.fn();
  KubeConfig.prototype.applyToFetchOptions = vi.fn();
  vi.mocked(KubeConfig.prototype.getCurrentCluster).mockReturnValue({
    name: 'mycluster',
    server: 'https://localhost:10001',
    skipTLSVerify: false,
  });

  vi.mocked(KubeConfig.prototype.applyToFetchOptions).mockResolvedValue({});

  SpecCache.prototype.getIndex = vi.fn().mockResolvedValue(index);
  SpecCache.prototype.getGroupVersionSpec = vi
    .fn()
    .mockReturnValue(appsv1.components.schemas['io.k8s.api.apps.v1.Deployment']);

  specReader = new SpecReader();
  vi.mocked(podmanDesktopApi.kubernetes.getKubeconfig).mockReturnValue({
    path: '/path/to/kube/config',
  } as podmanDesktopApi.Uri);
  vi.mocked(existsSync).mockReturnValue(true);
});

test('getSpecFromYamlManifest', async () => {
  const fetchResult = {
    json: vi.fn(),
  } as unknown as Response;
  vi.mocked(fetchResult.json).mockResolvedValue(appsv1);
  vi.mocked(fetch).mockResolvedValue(fetchResult);
  specReader.init();
  const res = await specReader.getSpecFromYamlManifest(`
apiVersion: apps/v1
kind: Deployment
`);
  expect(SpecCache.prototype.getGroupVersionSpec).toHaveBeenCalledWith(expect.anything(), 'apps/v1', 'Deployment');
  expect(res.spec).toHaveProperty('description', 'Deployment enables declarative updates for Pods and ReplicaSets.');
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
