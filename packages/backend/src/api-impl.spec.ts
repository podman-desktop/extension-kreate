import { test, vi } from 'vitest';
import { KreateApiImpl } from './api-impl';
import type { ExtensionContext } from '@podman-desktop/api';
import * as podmanDesktopApi from '@podman-desktop/api';

vi.mock('@podman-desktop/api', () => ({
  kubernetes: {
    getKubeconfig: vi.fn(),
  },
}));

vi.mock('@kubernetes/client-node');

test('constructor', () => {
  vi.mocked(podmanDesktopApi.kubernetes.getKubeconfig).mockReturnValue({
    path: '/path/to/kube/config',
  } as podmanDesktopApi.Uri);
  const context = {} as ExtensionContext;
  new KreateApiImpl(context);  
});
