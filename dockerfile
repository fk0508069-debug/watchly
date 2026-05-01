# Stage 1: Build
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

RUN apt-get update && apt-get install -y ca-certificates
# Set environment to production
ENV NODE_ENV=production
# This tells Next.js to listen on all network interfaces for AWS

ENV PORT=3000



EXPOSE 3000

# Run the server directly for better performance than 'npm start'
CMD ["npm", "start"]