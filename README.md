DataWorkbench API
=================

This is a Loopback application to provide an API for the DataWorkbench data.

Development
-----------

We use the [Git Flow](https://github.com/nvie/gitflow) approach.

To run a local version without docker, and responsive to changes in the code:

```npm install
nodemon app/server/server.js```

The *.local.js and *.local.json configuration files will be excluded from the Docker image.

The folder `local` can contain for instance the Google account info, and is excluded from git.
