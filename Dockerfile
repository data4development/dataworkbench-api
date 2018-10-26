# Dockerfile extending the generic Node image with application files for a
# single application.
FROM gcr.io/google_appengine/nodejs

# Allow specifying a build/run environment, use production as default
# NODE_ENV is set to 'production' in the Google base image so it can't be overridden by an ARG with that name 
ARG BUILD_ENV
ENV NODE_ENV=${BUILD_ENV:-production}

# Check to see if the the version included in the base runtime satisfies
# '>=0.12.7', if not then do an npm install of the latest available
# version that satisfies it.
RUN /usr/local/bin/install_node '>=0.12.7'

# First copy the package info and install node_modules (only needs to be done
# when the package file or versions change)
COPY package*.json /app/

# You have to specify "--unsafe-perm" with npm install
# when running as root.  Failing to do this can cause
# install to appear to succeed even if a preinstall
# script fails, and may have other adverse consequences
# as well.
# This command will also cat the npm-debug.log file after the
# build, if it exists.
RUN npm install --unsafe-perm || \
  ((if [ -f npm-debug.log ]; then \
      cat npm-debug.log; \
    fi) && false)

# Copy the rest of the app
COPY . /app/

EXPOSE 8080
# Implicit in base image:
# CMD npm start
