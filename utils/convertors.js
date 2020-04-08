'use strict';

exports.propertiesToResponse = function(properties) {
  const response = {};

  if (!properties || !Object.keys(properties).length) {
    return response;
  }

  Object.keys(properties).forEach((prop) => {
    response[prop] =
      properties[prop].default ||
      properties[prop].defaultFn ||
      properties[prop].type;
  });

  return response;
};
