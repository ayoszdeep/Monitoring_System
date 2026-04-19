FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies including devDependencies to build
RUN npm install

COPY . .

# Build TS files
RUN npm run build

RUN mkdir -p logs

EXPOSE 5000

CMD [ "npm", "start" ]