FROM scratch as builder
COPY packages/backend/dist/ /extension/dist
COPY packages/backend/package.json /extension/
COPY packages/backend/media/ /extension/media
COPY LICENSE /extension/
COPY packages/backend/icon.png /extension/
COPY README.md /extension/

FROM scratch

LABEL org.opencontainers.image.title="Kreate" \
        org.opencontainers.image.description="Provide templates and documentation to create Kubernetes resources" \
        org.opencontainers.image.vendor="podman-desktop" \
        io.podman-desktop.api.version=">= 1.16.0"

COPY --from=builder /extension /extension
