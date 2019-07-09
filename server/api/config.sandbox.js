'use strict';

var baseGet = {
  '*': false,
  exists: true,
  findById: true,
  find: true,
  findOne: true,
  count: true,
};

module.exports = {
  'iati-file': {
    public: {
      ...baseGet,
      download: true,
      getFiles: true,
      getFile: true,
    },
  },
  'iati-dataset': {
    public: { 
      ...baseGet,
      '__get__completesvrl': true,
      '__count__completesvrl': true,
    },
  },
  'iati-publisher': {
    public: { 
      ...baseGet,
      '__count__current': true,
      '__get__current': true,
      'prototype.__count__workspaces': true,
      'prototype.__get__workspaces': true,
      'prototype.__findById__workspaces': true,
    },
  },
  workspace: {
    public: { ...baseGet },
  },
  version: {
    public: { ...baseGet },
  },
  'iati-testfile': {
    public: { ...baseGet },
  },
  'iati-testdataset': {
    public: { ...baseGet },
  },
};
