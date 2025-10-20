# Build stage - compile Hugo site
FROM floryn90/hugo:0.151.0-ext AS builder

WORKDIR /src

# Copy source files
COPY . .

# Remove any existing public directory and build fresh
RUN rm -rf public && \
    hugo --gc --minify

# Runtime stage - serve with nginx
FROM nginx:alpine

# Copy built site
COPY --from=builder /src/public /usr/share/nginx/html

# Configure nginx to listen on port 8080
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
