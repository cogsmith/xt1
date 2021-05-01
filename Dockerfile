FROM node:15.8.0-alpine3.12
ENV NODE_ENV=production

WORKDIR /
RUN npm install --global nodemon

WORKDIR /xtnpm
RUN npm install @cogsmith/xt ; cp -a node_modules / ; npm list --depth=0

WORKDIR /xtlib
COPY ["package.json","package-lock.json*","./"]
RUN npm install --production
COPY . .
RUN node --check index.js

WORKDIR /app
RUN npm install --production ; exit 0
#CMD ["nodemon","app.js"]
CMD ["node","app.js","--loglevel trace"]