#!/bin/bash
# SPDX-License-Identifier: Apache-2.0

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
  npx hardhat compile && cp -rl ../typechain/* "${2}"/contracts/ \
    && find ../artifacts/contracts/*.sol/ \
    | grep -v ".dbg" | grep ".json" | xargs cp -l -t "${2}"/contracts/abi/
  # Clean up typechain generated files.
  rm -rf ./artifacts ./cache ./typechain
  cd "${CWD}"
}

#if [ "$#" -ne 1 ]; then
#  echo USAGE: $0 [path_to_contracts]
#  exit 1
#fi

CONTRACTSDIR="deps/erdstall-contracts/contracts"

if [[ ! -d $CONTRACTSDIR ]]; then
  echo $CONTRACTSDIR is not a valid directory
  exit 1
fi

SRCDIR="${PWD}"
ETHBACKEND="${SRCDIR}"/src/ledger/backend
ETHBACKEND_TEST="${SRCDIR}"/src/test/ledger/backend

checkInstalled npm
checkInstalledLocally typechain

compileTo "${CONTRACTSDIR}" "${ETHBACKEND}"

if [ "$?" -ne 0 ]; then
  echo ERROR: Unable to compile contracts and move abi.
  exit 1
fi
