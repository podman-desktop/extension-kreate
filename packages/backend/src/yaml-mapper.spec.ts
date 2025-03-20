import { expect, test } from 'vitest';
import { SourceMap } from './yaml-mapper';
import yaml from 'js-yaml';

test('getAtPos', () => {
  const content = `apiVersion: v1
kind: Pod
metadata:
  name: pod-name
`;
  const map = new SourceMap();
  yaml.load(content, { listener: map.listen() });
  const result = map.getAtPos(content.indexOf('name:'));
  expect(result).toEqual('.metadata.name');
});
