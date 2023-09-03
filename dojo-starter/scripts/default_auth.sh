#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export WORLD_ADDRESS="0x7d1f066a910bd86f532fa9ca66766722c20d47462fb99fb2fb0e1030262f9c5";

# enable system -> component authorizations
COMPONENTS=("Position" "Moves" )

for component in ${COMPONENTS[@]}; do
    sozo auth writer $component spawn --world $WORLD_ADDRESS
done

for component in ${COMPONENTS[@]}; do
    sozo auth writer $component move --world $WORLD_ADDRESS
done
sozo auth writer Random random --world $WORLD_ADDRESS
sozo auth writer Random block --world $WORLD_ADDRESS
sozo auth writer Block block --world $WORLD_ADDRESS
sozo auth writer Block random --world $WORLD_ADDRESS

echo "Default authorizations have been successfully set."