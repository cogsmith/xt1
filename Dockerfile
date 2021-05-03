FROM node:15.8.0-alpine3.12
ENV NODE_ENV=production

#

#ENV FORCE_COLOR=0
#ENV NODE_DISABLE_COLORS=0
#ENV NODE_ENV=production
#ENV NO_UPDATE_NOTIFIER=1

#ENV TERM=xterm-256color
#ENV TERM=linux
#ENV TERM=dumb

#

#ENV FORCE_COLOR=0
#ENV NO_UPDATE_NOTIFIER=true
#ENV NODE_DISABLE_COLORS=1
#ENV TERM=dumb

#

WORKDIR /
RUN npm config set update-notifier false 2> /dev/null
RUN npm install --global nodemon pm2

WORKDIR /xtnpm
RUN echo -e "#\n#" ; echo 20210503_103253 ; echo `date` ; echo -e "#\n#" ; npm install @cogsmith/xt ; echo -e "#\n#" ; cp -a node_modules / ; npm list --depth=0 ; echo -e "#\n#" ; ls -laR /node_modules/@cogsmith ; echo -e "#\n#"

WORKDIR /xtlib
COPY ["package.json","package-lock.json*","./"]
RUN npm install
COPY . .
RUN chmod a+x bin/* ; cp bin/* /bin
RUN node --check index.js ; echo -e "#\n#"

#

ENV FORCE_COLOR=1
#ENV NO_UPDATE_NOTIFIER=0
#ENV NODE_DISABLE_COLORS=0
#ENV TERM=linux

WORKDIR /app
ENTRYPOINT ["node","app.js"]
CMD ["--loglevel trace","--logjson 0"]

#