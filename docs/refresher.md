---
title: Data refresher
order: 3
---

### Data Refresher

The data refresher is run regularly:

- It checks all available datasets at the IATI Registry
- It downloads all files as a snapshot, and updates a repository with archived versions.
- It triggers the Validation Engine to process all new files. If the Validation Engine itself is updated, all files will be re-validated.
- It uploads the new files into the File Store, and updates the information about available datasets in the Dataset Info database.

```mermaid
sequenceDiagram
participant DS as Dataset Info
participant FS as File Store
participant DR as Data Refresher
participant VE as Validation Engine

activate DR
note over DR: gather new files

DR->>VE: trigger validation pipeline
activate VE
note over DR,VE: process files and create validation reports
VE->>DR: new files ready
deactivate VE

DR->>FS: store report files
DR->>DS: add dataset info records

deactivate DR
```
