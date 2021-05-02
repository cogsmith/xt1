FROM node:15.8.0-alpine3.12
ENV NODE_ENV=production

#

#ENV FORCE_COLOR=0
#ENV NODE_DISABLE_COLORS=0
#ENV NODE_ENV=production
#ENV NO_UPDATE_NOTIFIER=1
#ENV TERM=dumb

#

ENV FORCE_COLOR=0
#ENV NO_UPDATE_NOTIFIER=true
#ENV NODE_DISABLE_COLORS=1
#ENV TERM=dumb

WORKDIR /
RUN npm config set update-notifier false 2> /dev/null
RUN npm install --global nodemon strip-ansi-cli 

WORKDIR /bin
RUN echo '#!/bin/sh' > xtnodemon ; echo 'nodemon --delay 2.5 --ignore package.json --ignore package.json /app/app.js "$@"' >> xtnodemon ; chmod a+x xtnodemon

WORKDIR /xtnpm
RUN echo -e "#\n#" ; echo `date` ; echo -e "#\n#" ; npm install @cogsmith/xt ; echo -e "#\n#" ; cp -a node_modules / ; npm list --depth=0 ; echo -e "#\n#" ; ls -laR /node_modules/@cogsmith ; echo -e "#\n#"

WORKDIR /xtlib
COPY ["package.json","package-lock.json*","./"]
RUN npm install | strip-ansi
COPY . .
RUN node --check index.js ; echo -e "#\n#"

WORKDIR /app
RUN npm install ; exit 0

#

ENV FORCE_COLOR=1
#ENV NO_UPDATE_NOTIFIER=0
#ENV NODE_DISABLE_COLORS=0
#ENV TERM=linux

WORKDIR /app
ENTRYPOINT ["node","app.js"]
CMD ["--loglevel trace","--logjson 0"]

#


# ##########################################################################################

#CMD ["nodemon","app.js"]

#RUN echo 'echo $@' > /bin/xtnodemon
# docker run -it --name XTNODE -v $PWD:/app --entrypoint sh cogsmith/xtnode