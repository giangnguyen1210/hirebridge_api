# 1. Dùng Nginx Alpine làm nền
FROM nginx:alpine

# 2. Xóa config mặc định của Nginx (để tránh xung đột)
RUN rm /etc/nginx/conf.d/default.conf

# 3. Copy file nginx.conf chính của bạn vào container
COPY nginx.conf /etc/nginx/nginx.conf

# 3.5. Copy CORS map configuration
COPY cors-map.conf /etc/nginx/cors-map.conf

# 4. Copy thư mục chứa các file routing (auth.conf, product.conf...)
COPY conf.d/ /etc/nginx/conf.d/

# 5. Expose cổng 80 (cổng mặc định của Nginx trong container)
EXPOSE 80

# 6. Chạy Nginx (Lệnh mặc định của image gốc rồi, không cần viết lại cũng được)
CMD ["nginx", "-g", "daemon off;"]