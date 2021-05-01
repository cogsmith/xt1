FROM node:15.8.0-alpine3.12
ENV NODE_ENV=production

WORKDIR /
RUN npm install @cogsmith/xt
RUN npm install --global nodemon

WORKDIR /xt
COPY ["package.json","package-lock.json*","./"]
RUN npm install --production
COPY . .
RUN node --check index.js

WORKDIR /app
#CMD ["nodemon","app.js"]
CMD ["node","app.js"]