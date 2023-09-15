/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  BehaviorSelect,
  BehaviorSelectInterface,
} from "../../../contracts/testing/BehaviorSelect";

const _abi = [
  {
    inputs: [],
    name: "reset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum BehaviorSelect.Mode",
        name: "mode_",
        type: "uint8",
      },
    ],
    name: "setMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum BehaviorSelect.Mode",
        name: "before_",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "countdown_",
        type: "uint256",
      },
      {
        internalType: "enum BehaviorSelect.Mode",
        name: "after_",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "resetCount_",
        type: "uint256",
      },
    ],
    name: "setModeWithCountdown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061025d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806321175b4a1461004657806354ed9e321461005b578063d826f88f1461006e575b600080fd5b610059610054366004610192565b61007d565b005b6100596100693660046101b4565b6100ed565b61005960006001819055600355565b600060019081557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6003556002805483927fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00909116908360058111156100e5576100e56101f8565b021790555050565b600080548591907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561012a5761012a6101f8565b021790555060018381556002805484927fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0090911690836005811115610171576101716101f8565b0217905550600355505050565b80356006811061018d57600080fd5b919050565b6000602082840312156101a457600080fd5b6101ad8261017e565b9392505050565b600080600080608085870312156101ca57600080fd5b6101d38561017e565b9350602085013592506101e86040860161017e565b9396929550929360600135925050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fdfea264697066735822122005ea48e3dded524b992151c2c094be280bd46da241ec25a83e24702c951b607564736f6c63430008060033";

type BehaviorSelectConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BehaviorSelectConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BehaviorSelect__factory extends ContractFactory {
  constructor(...args: BehaviorSelectConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<BehaviorSelect> {
    return super.deploy(overrides || {}) as Promise<BehaviorSelect>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BehaviorSelect {
    return super.attach(address) as BehaviorSelect;
  }
  override connect(signer: Signer): BehaviorSelect__factory {
    return super.connect(signer) as BehaviorSelect__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BehaviorSelectInterface {
    return new utils.Interface(_abi) as BehaviorSelectInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BehaviorSelect {
    return new Contract(address, _abi, signerOrProvider) as BehaviorSelect;
  }
}
