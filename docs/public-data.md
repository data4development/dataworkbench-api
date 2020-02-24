---
title: Public data viewer flow
order: 1
---

### API on public files

The API runs behind a load balancer, and interfaces with both the file store and the dataset information database.

At the moment, the API requires a two-step approach:

- Get dataset information about a specific publisher, dataset, or download URL. This will include an MD5 checksum of the dataset source file.
- Download the required result format of the validation as a file, based on the MD5 checksum.

```mermaid
sequenceDiagram
participant C as Client
participant API
participant DS as Dataset Info
participant FS as File Store

C->>API: get dataset info
activate API

API->>DS: get info about dataset
activate DS
DS-->>API: return md5, download date, ...
deactivate DS

API-->>C: dataset info
deactivate API

C->>API: get file a in specific format
activate API
API->>FS: get dataset file
activate FS
FS-->>API: results as IATI, SVRL, HTML, ...
deactivate FS

API-->>C: 
deactivate API
```
