#!/bin/bash

cmd_surreal_sql="surreal sql --conn ws://localhost:3001 --user root --pass root --ns test --db test --pretty --hide-welcome"

echo "SELECT * FROM users;" | exec $cmd_surreal_sql