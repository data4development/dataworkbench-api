---
title: IATI Datastore Synchronisation
order: 3
---

The IATI Datastore synchronisation consists of several parts:

* An update job to load information from the IATI Registry about publishers and datasets.
* A data refresher job to download files from the IATI Datastore.
* A data validation service that processes IATI files and generates validation reports.
* A janitor job to remove obsolete files and datasets from the system.

The update job and janitor job currently run in separate containers with a different stack.

## Data Refresher

The synchronisation with the Datastore is done by running the API container with environment variables to schedule the synchronisation job.

```mermaid
sequenceDiagram

participant DSJ as Data Sync Job
participant DS as Dataset Info
participant FS as File Store
participant DSt as IATI Datastore

loop Every 2 hours
  activate DSJ
  DSJ ->>+ DS: get datasets
  DS -->>- DSJ: existing datasets
  loop For all dataset pages on the IATI Data Store
    DSJ ->>+ DSt: get dataset information (per page)
    DSt -->>- DSJ: dataset info
  end
  note over DSJ: Filter files: with internal_url and unknown sha1
  loop For all files to be retrieved
    DSJ ->>+ DSt: get file via internal_url
    DSt -->>- DSJ: IATI source file
    note over DSJ: Calculate md5
    DSJ ->>+ FS: store file using md5 as name
    FS -->>- DSJ: 
    DSJ ->>+ DS: store dataset info
    DS -->>- DSJ: 
  end
  deactivate DSJ
end
```

## Datastore

The IATI Datastore updates the data using the pre-compiled validation reports where available, and asking for ad-hoc validation if there is no pre-compiled validation report.

```mermaid
sequenceDiagram
participant DSt as IATI Datastore
participant FS as File Store
participant AHV as Ad-hoc validation

loop For all IATI files
  note over DSt: Calculate md5
  DSt ->>+ FS: Get JSON report for md5
  alt md5 exists
  	FS -->> DSt: JSON report
  else 
    FS -->>- DSt: Status 500
    DSt ->>+ AHV: Upload file
    loop Every x seconds while no JSON report available
      DSt ->> AHV: Check for completion
      AHV -->>- DSt: JSON report info
    end
    DSt ->>+ AHV: Get JSON report
    AHV -->>- DSt: JSON report
  end
  note over DSt: If no critical errors, include file in IATI Datastore
end
```