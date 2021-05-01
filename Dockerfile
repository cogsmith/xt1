FROM node:15.8.0-alpine3.12
ENV NODE_ENV=production
WORKDIR /xt
RUN cd / ; npm remove @cogsmith/xt ; npm install @cogsmith/xt ; cd /xt
RUN npm install --global nodemon
COPY ["package.json","package-lock.json*","./"]
RUN npm install --production
COPY . .
RUN node --check /xt/index.js
#CMD ["nodemon","app.js"]
CMD ["node","app.js"]