FROM node:18 AS builder

WORKDIR /app

COPY ../package*.json ./
RUN npm install

COPY ../ .  
RUN npm run build --configuration=production

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy compiled Angular app to Nginx html folder
COPY --from=builder /app/dist/angular-bingo-app /usr/share/nginx/html

# Optional: Replace default Nginx config with your own
COPY k8s/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
