# Reverse-proxy nginx for La Plume Artisanale ERP
FROM nginx:alpine

# Remove default site
RUN rm -f /etc/nginx/conf.d/default.conf

# Full custom nginx.conf (replaces the bundled one)
COPY nginx.conf /etc/nginx/nginx.conf

# Prepare webroot for Let's Encrypt HTTP-01 challenges
RUN mkdir -p /var/www/certbot && chown -R nginx:nginx /var/www/certbot

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
