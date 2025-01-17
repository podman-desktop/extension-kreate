#!/bin/sh

# kind version 0.22.0, api v1.29.2
mkdir -p packages/backend/tests/openapi-dump
kubectl get --raw /openapi/v3 | json_pp > packages/backend/tests/openapi-dump/index.json

mkdir -p packages/backend/tests/openapi-dump/openapi/v3/api
kubectl get --raw '/openapi/v3/api/v1?hash=2A0B7D1DD0AF45569217219A34EF7E93C9AA2026A039B7C199C8677779832FB2D69D1CB6DA68A0EBE54F0EFDDB2DB2ABFC47CE8DF8213B52ED5BF31C9AC42BC4' \
  | json_pp > packages/backend/tests/openapi-dump/openapi/v3/api/v1.json

mkdir -p packages/backend/tests/openapi-dump/openapi/v3/apis/apps
kubectl get --raw '/openapi/v3/apis/apps/v1?hash=F4DD503FF61FBD577AD7F77A609B8C9F2A5AB8ACA2F07A03A671135A780A41960D0330184D279EBF65055716A34D94D9EFA54D4E820B3B0A640FC0FE769E4A43' \
  | json_pp > packages/backend/tests/openapi-dump/openapi/v3/apis/apps/v1.json
