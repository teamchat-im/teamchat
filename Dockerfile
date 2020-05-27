## base stage

FROM ubuntu:20.04 AS base

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ffmpeg \
  imagemagick \
  libpq-dev \
  nodejs \
  postgresql-client \
  ruby \
  ruby-dev \
  zlib1g-dev

RUN apt-get update && apt-get install -y --no-install-recommends curl gnupg && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y --no-install-recommends yarn && \
  apt-get autoremove -y curl gnupg

RUN gem install bundler -v 2.1.4

WORKDIR /teamchat

## production stage

FROM base AS production

ENV RAILS_ENV=production

COPY Gemfile Gemfile.lock /campo/

RUN bundle install --deployment --without test development && \
  rm vendor/bundle/ruby/2.5.0/cache/*

COPY . /campo/

RUN bin/rails assets:precompile && \
  yarn cache clean && \
  rm -rf node_modules tmp/cache/* /tmp/*
