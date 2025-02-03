FROM nginx:alpine

COPY build/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
