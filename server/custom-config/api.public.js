'use strict';

module.exports = {
  'iati-file': {
    public: {
      fileDownload: true,
    },
  },
  'iati-dataset': {
    public: {
      __get__completesvrl: true,
      __count__completesvrl: true,
    },
  },
  'iati-publisher': {
    public: {
      'prototype.__get__workspaces': true,
      'prototype.__count__workspaces': true,
      'prototype.__findById__workspaces': true,
      __get__current: true,
      __count__current: true,
      __findOne__current: true,
    },
  },
  workspace: {
    public: {
      'prototype.__get__versions': true,
      'prototype.__count__versions': true,
      'prototype.__findById__versions': true,
    },
  },
  version: {
    public: {},
  },
  'iati-testfile': {
    public: {
      fileUpload: true,
      fileDownload: true,
    },
  },
  'iati-testdataset': {
    public: {
      find: false,
      count: false,
      findOne: false,
      create: false,
      upload: false,
    },
  },
  'iati-testworkspace': {
    public: {
      find: false,
      count: false,
      findOne: false,
      create: true,
      upload: false,
      fileUpload: true,
      fetchFileByURL: true,
      'prototype.patchAttributes': true,
      'prototype.__get__datasets': true,
      'prototype.__count__datasets': true,
      'prototype.__findById__datasets': true,
      'prototype.__create__datasets': true,
      'prototype.__get__files': true,
      'prototype.__count__files': true,
      'prototype.__findById__files': true,
      'prototype.__create__files': true,
    },
  },
};
