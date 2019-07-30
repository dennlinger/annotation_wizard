#!/bin/bash

# Argument order:
# (1) root directory
# (2) port number for backend [frontend is backend -1]
# (3) data file location
# (4) password

frontendPort=`expr $2 - 1`
# set up files
mkdir $1/output/
cp $3 $1/input/test1.tsv
echo '{"password":"'$4'","counter":0,"annotated":0}' > $1/secrets.json

# replace port numbers
sed -i 's/3001/'$2'/g' $1/backend.js
sed -i 's/3001/'$2'/g' $1/wizard/package.json
sed -i 's/300/'$frontendPort'/g' $1/wizard/package.json
