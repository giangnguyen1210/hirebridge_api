# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock tsconfig*.json nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

RUN yarn install --frozen-lockfile
RUN yarn build
# Copy templates manually since tsc doesn't copy non-TS files
RUN cp -r apps/notification-service/src/mail/templates dist/apps/notification-service/src/mail/ || true



# Stage 2: Runtime
FROM node:20-alpine as production

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

# 1. Copy đúng cấu trúc thư mục
COPY --from=builder /app/dist/apps/${SERVICE_NAME} ./dist/apps/${SERVICE_NAME}
COPY --from=builder /app/dist/libs ./dist/libs

COPY tsconfig.json ./
COPY package.json ./

# 2. BƯỚC QUAN TRỌNG: "Hack" lại đường dẫn trong tsconfig.json
# Lệnh này đổi tất cả đường dẫn từ 'libs/.../src' thành 'dist/libs/...'
# Giúp Docker hiểu rằng code lib đã được build và nằm trong thư mục dist
RUN sed -i 's|libs/|dist/libs/|g' tsconfig.json

EXPOSE 6060

# 3. Chạy đúng đường dẫn CÓ folder src (theo log của bạn)
# Và dùng -r tsconfig-paths/register để Node hiểu được alias @app/common
CMD node -r tsconfig-paths/register dist/apps/${SERVICE_NAME}/src/main.js