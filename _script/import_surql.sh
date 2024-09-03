#!/bin/bash

# Parent directory of this script
MY_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


find $MY_PATH/../_surql/ -maxdepth 1 -iname "*.surql" -exec surreal import --conn http://localhost:3001 --user root --pass root --ns test --db test {} \;