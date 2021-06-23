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
ETHBACKEND="${SRCDIR}"/src/ledger/backend

checkInstalled npm
checkInstalledLocally typechain hardhat

mkdir -p "${ETHBACKEND}"/contracts
mkdir -p "${ETHBACKEND}"/contracts/abi

cd $CONTRACTSDIR
echo $PWD
npx hardhat compile && cp -r ./typechain/* "${ETHBACKEND}"/contracts/ \
  && find ./artifacts/contracts/{PerunToken,TokenHolder,Erdstall,ETHHolder,ERC20Holder,ERC721Holder}.sol/ \
  | grep -v ".dbg" | grep ".json" | xargs cp -t "${ETHBACKEND}"/contracts/abi/

if [ $? -ne 0 ]; then
  echo ERROR: Unable to compile contracts and move abi.
  exit 1
fi
