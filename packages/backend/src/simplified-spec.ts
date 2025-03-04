import type { OpenAPIV3 } from 'openapi-types';
import type { SimplifiedSpec } from '/@shared/src/models/SimplifiedSpec';

export function getSimplifiedSpec(
  spec: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
  name: string,
): SimplifiedSpec {
  if (isReferenceObject(spec)) {
    throw new Error('reference');
  }

  const result: SimplifiedSpec = {
    name: name ?? '',
    type: getType(spec),
    description: spec.description ?? '',
    typeDescription: '',
    children: [],
    isArray: false,
  };

  if (spec.type === 'object' && !!spec.properties) {
    for (const [property, subSpec] of Object.entries(spec.properties)) {
      if (isReferenceObject(subSpec)) {
        throw new Error('reference');
      }
      result.children.push(getSimplifiedSpec(subSpec, property));
    }
  } else if (spec.allOf) {
    if (spec.allOf.length !== 1) {
      throw new Error('more than 1 allOf');
    }
    const of = getSimplifiedSpec(spec.allOf[0], '');
    if (of.description) {
      result.typeDescription = of.description;
    }
    result.children = of.children;
  } else if (isArraySchemaObject(spec)) {
    result.isArray = true;
    const item = getSimplifiedSpec(spec.items, '');
    result.typeDescription = item.typeDescription;
    result.children = item.children;
  }
  return result;
}

export interface SubspecOptions {
  pathInSpec: string[];
  maxDepth: number;
}

export function getSubspec(spec: SimplifiedSpec, options: SubspecOptions): SimplifiedSpec {
  const path = [...options.pathInSpec];
  while (path.length) {
    if (isNumeric(path[0])) {
      path.shift();
      continue;
    }
    const child = spec.children.find(child => child.name === path[0]);
    path.shift();
    if (!child) {
      throw new Error(`pathInSpec ${options.pathInSpec} not found in spec`);
    }
    spec = child;
  }
  return limitDepth(spec, options.maxDepth);
}

function limitDepth(spec: SimplifiedSpec, depth: number): SimplifiedSpec {
  return {
    ...spec,
    children: !depth ? [] : spec.children.map(child => limitDepth(child, depth - 1)),
  };
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

function isReferenceObject(
  spec: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): spec is OpenAPIV3.ReferenceObject {
  return typeof spec === 'object' && '$ref' in spec;
}

function isSchemaObject(
  additionalProperties: undefined | boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): additionalProperties is OpenAPIV3.SchemaObject {
  return !!additionalProperties && typeof additionalProperties !== 'boolean' && 'type' in additionalProperties;
}

function isArraySchemaObject(spec: OpenAPIV3.SchemaObject): spec is OpenAPIV3.ArraySchemaObject {
  return spec.type === 'array';
}

function getType(spec: OpenAPIV3.SchemaObject, _options?: { subtype: boolean }): string {
  if (!spec.type) {
    return '';
  }
  let type = `${spec.type}`;
  if (spec.type === 'array' && !isReferenceObject(spec.items)) {
    if (spec.items.allOf?.[0] && !isReferenceObject(spec.items.allOf[0])) {
      type = `[]${getType(spec.items.allOf[0], { subtype: true })}`;
    } else {
      type = `[]${getType(spec.items, { subtype: true })}`;
    }
  }
  if (type === 'object' && isSchemaObject(spec.additionalProperties)) {
    let subtype = `${spec.additionalProperties.type}`;
    if (spec.additionalProperties.format === 'byte') {
      subtype = '[]byte';
    }
    type = `map[string]${subtype}`;
  }
  if (type) {
    return type;
  }
  return '';
}
