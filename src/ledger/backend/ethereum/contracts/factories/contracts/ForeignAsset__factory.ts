/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  ForeignAsset,
  ForeignAssetInterface,
} from "../../contracts/ForeignAsset";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "holder",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052348015600f57600080fd5b506000805460ff1916600117905560b08061002b6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063e534155d14602d575b600080fd5b600054605190610100900473ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f3fea2646970667358221220af3735686d1e4270b250a2b6e555b2f82fc22b8a548d7ffedc356c87b029593364736f6c63430008180033";

type ForeignAssetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ForeignAssetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ForeignAsset__factory extends ContractFactory {
  constructor(...args: ForeignAssetConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      ForeignAsset & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ForeignAsset__factory {
    return super.connect(runner) as ForeignAsset__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ForeignAssetInterface {
    return new Interface(_abi) as ForeignAssetInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ForeignAsset {
    return new Contract(address, _abi, runner) as unknown as ForeignAsset;
  }
}
