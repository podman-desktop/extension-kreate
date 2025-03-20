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

import type { ExtensionContext } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import fs from 'node:fs';
import { RpcExtension } from '/@shared/src/messages/MessageProxy';
import { KreateApiImpl } from './api-impl';
import type { KreateApi } from '/@shared/src/KreateApi';

/**
 * Below is the "typical" extension.ts file that is used to activate and deactrivate the extension.
 * this file as well as package.json are the two main files that are required to develop a Podman Desktop extension.
 */

// Initialize the activation of the extension.
export async function activate(extensionContext: ExtensionContext): Promise<void> {
  console.log('starting kreate extension');

  // A web view panel is created to display the index
  // we use the 'media' folder that contains the bread-and-butter of the webview.
  // it is assumed that index.html is the main file that is being displayed and all other files have already been generated.
  //
  // The 'index.html' and all other files are built with the `yarn build` command within packages/frontend which can also be ran with the
  // `yarn build` command in the main directory, which will also build the backend and shared packages.
  const panel = extensionApi.window.createWebviewPanel('kreate', 'Kreate', {
    localResourceRoots: [extensionApi.Uri.joinPath(extensionContext.extensionUri, 'media')],
  });
  extensionContext.subscriptions.push(panel);

  // Set the index.html file for the webview.
  const indexHtmlUri = extensionApi.Uri.joinPath(extensionContext.extensionUri, 'media', 'index.html');
  const indexHtmlPath = indexHtmlUri.fsPath;
  let indexHtml = await fs.promises.readFile(indexHtmlPath, 'utf8');

  // TEMPORARY. This is a workaround to replace the src of the script tag in the index.html file so that links work correctly.
  // In the content <script type="module" crossorigin src="./index-RKnfBG18.js"></script> replaces src with webview.asWebviewUri
  const scriptLink = indexHtml.match(/<script[^>]+src="([^"]*)"[^>]*>/g);
  if (scriptLink) {
    scriptLink.forEach(link => {
      const src = /src="([^"]*)"/.exec(link);
      if (src) {
        const webviewSrc = panel.webview.asWebviewUri(
          extensionApi.Uri.joinPath(extensionContext.extensionUri, 'media', src[1]),
        );
        indexHtml = indexHtml.replace(src[1], webviewSrc.toString());
      }
    });
  }

  // TEMPORARY. We do the same for the css link
  const cssLink = indexHtml.match(/<link[^>]+href="([^"]*)"[^>]*>/g);
  if (cssLink) {
    cssLink.forEach(link => {
      const href = /href="([^"]*)"/.exec(link);
      if (href) {
        const webviewHref = panel.webview.asWebviewUri(
          extensionApi.Uri.joinPath(extensionContext.extensionUri, 'media', href[1]),
        );
        indexHtml = indexHtml.replace(href[1], webviewHref.toString());
      }
    });
  }

  // Update the webview panel with the new index.html file with corrected links.
  panel.webview.html = indexHtml;

  // We now register the 'api' for the webview to communicate to the backend
  const rpcExtension = new RpcExtension(panel.webview);
  const kreateApi = new KreateApiImpl(extensionContext);
  rpcExtension.registerInstance<KreateApi>(KreateApiImpl, kreateApi);
}

export async function deactivate(): Promise<void> {
  console.log('stopping kreate extension');
}
