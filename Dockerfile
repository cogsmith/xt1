FROM node:15.8.0-alpine3.12

#

ENV NODE_ENV=production
ENV FORCE_COLOR=1

WORKDIR /
RUN npm install --global nodemon

WORKDIR /bin
RUN echo '#!/bin/sh' > xtnodemon ; echo 'nodemon --delay 2.5 --ignore package.json --ignore package.json /app/app.js "$@"' >> xtnodemon ; chmod a+x xtnodemon

WORKDIR /xtnpm
RUN npm config set update-notifier false ; echo -e "#\n#" ; npm install @cogsmith/xt --no-update-notifier ; echo -e "#\n#" ; cp -a node_modules / ; npm list --depth=0 ; echo -e "#\n#" ; ls -laR /node_modules/@cogsmith ; echo -e "#\n#" ; echo `date` ; echo -e "#\n#"

WORKDIR /xtlib
COPY ["package.json","package-lock.json*","./"]
RUN npm install --production --no-update-notifier
COPY . .
RUN echo -e "#\n#" ; node --check index.js ; echo -e "#\n#"

WORKDIR /app
RUN export TERM=dumb ; npm install --production --no-update-notifier ; exit 0

WORKDIR /app
ENTRYPOINT ["node","app.js"]
CMD ["--loglevel trace","--logjson 0"]

#

#CMD ["nodemon","app.js"]

#RUN echo 'echo $@' > /bin/xtnodemon
# docker run -it --name XTNODE -v $PWD:/app --entrypoint sh cogsmith/xtnode