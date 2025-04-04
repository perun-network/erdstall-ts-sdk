#!/bin/bash
# SPDX-License-Identifier: Apache-2.0

#erdstall-ts-sdk$ bash scripts/genbindings.sh ~/.go/src/github.com/perun-network/erdstall-mono/ethereum/contracts/

function checkInstalled() {
  allSet=true
  for cmd in "$@"; do
    if ! command -v "$cmd" &> /dev/null; then
      echo ERROR: Make sure "$cmd" is installed
      allSet=false
    fi
  done
  if ! $allSet; then
    exit 1
  fi
}

function checkInstalledLocally() {
  allSet=true
  for cmd in "$@"; do
    if ! npm ls | grep "$cmd" &> /dev/null; then
      echo ERROR: Make sure to execute "npm install" before generating contract bindings
      allSet=false
      break
    fi
  done
  if ! $allSet; then
    exit 1
  fi
}

function compileTo() {
  if [ ! -d "$1" ] || [ ! -d "$2" ]; then
    echo ERROR: No valid source or destination specified
    echo compileTo [source] [destination]
    exit 1
  fi

  CWD="${PWD}"
  cd "${1}"

  # Clean up existing bindings.
  rm -rf "${2}"/contracts
  mkdir -p "${2}"/contracts/abi
  yarn hardhat compile && yarn hardhat typechain && cp -rl ./typechain-types/* "${2}"/contracts/ \
    && find ./artifacts/contracts/*.sol/ \
    | grep -v ".dbg" | grep ".json" | xargs cp -l -t "${2}"/contracts/abi/
  # Clean up typechain generated files.
  rm -rf ./artifacts ./cache ./typechain-types
  cd "${CWD}"
}

if [ "$#" -ne 1 ]; then
  echo USAGE: $0 [path_to_contracts]
  exit 1
fi

CONTRACTSDIR="$1"

if [[ ! -d $CONTRACTSDIR ]]; then
  echo $CONTRACTSDIR is not a valid directory
  exit 1
fi

SRCDIR="${PWD}"
ETHBACKEND="${SRCDIR}"/src/ledger/backend/ethereum

checkInstalled npm
checkInstalledLocally typechain

compileTo "${1}" "${ETHBACKEND}"

if [ $? -ne 0 ]; then
  echo ERROR: Unable to compile contracts and move abi.
  exit 1
fi
