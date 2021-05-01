FROM node:15.8.0-alpine3.12
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json","package-lock.json*","./"]
RUN npm remove @cogsmith/xt ; npm install @cogsmith/xt
RUN npm install --production
RUN npm install --global nodemon
COPY . .
RUN node --check /app/index.js
#CMD ["nodemon","app.js"]
CMD ["node","app.js"]