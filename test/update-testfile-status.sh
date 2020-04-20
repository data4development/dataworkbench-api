#!/bin/bash
API=${API:-http://localhost:3000/api/v1}
NOW=`date --iso-8601=seconds`

api() {
    curl -sS -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' \
    -d "$1" \
    "$API/iati-testdatasets/update?where=%7B%22type%22%3A%20%22text%2Fxml%22%7D"
}

case "$1." in

  1.)
    APIDATA="{\"processing\": \"$NOW\", \"status\": \"File uploaded (step 1 of 3)\"}"
    api "$APIDATA"
    ;;

  2.)
    APIDATA="{\"processing\": \"$NOW\", \"status\": \"Processing validation rules (step 2 of 3)\"}"
    api "$APIDATA"
    ;;

  3.)
    APIDATA="{\"processing\": \"$NOW\", \"status\": \"Generating report (step 3 of 3)\"}"
    api "$APIDATA"
    ;;

  4.)
    APIDATA="{\"json-updated\": \"$NOW\", \"json-version\": \"1.1\", \"status\": \"Report generated\"}"
    api "$APIDATA"
    ;;

  *)
    echo "$0 [1|2|3|4]"
    echo "set all iati-testdatasets to status step 1, 2, 3 or done"
esac