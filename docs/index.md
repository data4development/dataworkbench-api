---
title: IATI Validator API
order: 0
---

The IATI data validator API provides access to a store of IATI data files and their validations. It is still in development, so the architecture and APIs may change.

The pages here explain the architecture and data model behind the API.

## End point documentation

API end point documentation is available in a couple of ways.

### Postman

The [IATI Validator collection in Postman](https://api-doc.dataworkbench.io) shows how the web front-end uses the API. It has API calls organised per page of the interface.

In addition, it will have a section on how the DataStore uses the Validator API.

These API calls are also available as a mock server to help in development.

The documentation is based on the source specification, with additional information added.

### Loopback

The API is developed in Loopback, and provides [an Explorer](http://www.dataworkbench.io/explorer) to interact with the it and try out calls.

This can also be used when running a local copy of the API.

### Specification page

The [Specification page](specification.html) uses the OpenAPI specification file to create a reference documentation page.

## Query language documentation

The query language is provided by Loopback version 3. Filtering, ordering and limiting results and including fields is documented on [the Loopback site](https://loopback.io/doc/en/lb3/Querying-data.html).  
