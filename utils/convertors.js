'use strict';

// TODO: add other response type(example array)
exports.propertiesToResponse = function(properties) {
  if (!properties || !Object.keys(properties).length) {
    return response;
  }
  var response = {};

  for (var prop in properties) {
    response[prop] =
      properties[prop].default ||
      properties[prop].defaultFn ||
      properties[prop].type;
  }

  return response;
};
