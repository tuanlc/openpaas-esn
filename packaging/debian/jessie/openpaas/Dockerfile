#
# Docker container for building openpaas package
#

FROM linagora/fpm-debian-jessie
MAINTAINER Linagora Folks <openpaas@linagora.com>

ARG DEBIAN_FRONTEND=noninteractive
ARG VERSION=0.0.0
ARG ITERATION=1
ARG TREEISH=master

RUN apt-get update && apt-get install -y wget && \
    wget -q -O - http://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -; \
    echo "deb http://deb.nodesource.com/node_6.x jessie main" > /etc/apt/sources.list.d/node.list && \
    apt-get update && \
    apt-get -y install git build-essential python-setuptools graphicsmagick g++ nodejs \
    graphicsmagick-imagemagick-compat libjpeg-dev libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev

RUN git clone --no-single-branch --depth=1 https://ci.open-paas.org/stash/scm/or/rse.git /package/usr/share/openpaas

ADD common/openpaas/package /package
ADD debian/jessie/openpaas/package /package

ADD common/openpaas/openpaas.preinst /root/
ADD common/openpaas/openpaas.postinst /root/
ADD common/openpaas/openpaas.postrm /root/
ADD common/openpaas/openpaas.prerm /root/

WORKDIR /package/usr/share/openpaas
RUN git checkout $TREEISH && npm i --production && ./node_modules/bower/bin/bower install --allow-root && \
    find . -name .git -type d -exec rm -rf {} +

WORKDIR /package
RUN fpm \
  -s dir \
  -t deb \
  --name openpaas \
  --version $VERSION \
  --iteration $ITERATION \
  --license AGPLv3 \
  --vendor Linagora \
  --maintainer "Linagora Folks <lgs-openpaas-dev@linagora.com>" \
  --description "OpenPaas Enterprise Social Network - *DAV Server" \
  --url "http://open-paas.org" \
  --architecture x86_64 \
  --directories /etc/openpaas \
  --directories /var/log/openpaas \
  --directories /usr/share/openpaas \
  --deb-user openpaas \
  --deb-group openpaas \
  --depends nginx \
  --depends elasticsearch \
  --depends mongodb-org \
  --depends redis-server \
  --depends rabbitmq-server \
  --depends openjdk-8-jdk \
  --depends nodejs \
  --depends graphicsmagick \
  --depends graphicsmagick-imagemagick-compat \
  --depends libjpeg-dev \
  --depends libcairo2-dev \
  --depends libjpeg62-turbo-dev \
  --depends libpango1.0-dev \
  --depends libgif-dev \
  --before-install /root/openpaas.preinst \
  --after-install /root/openpaas.postinst \
  --before-remove /root/openpaas.prerm \
  --after-remove /root/openpaas.postrm \
  .

VOLUME /result

ENTRYPOINT cp /package/openpaas*.deb /result/
