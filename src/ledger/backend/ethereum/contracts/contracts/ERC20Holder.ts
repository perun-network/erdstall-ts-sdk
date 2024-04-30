/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface ERC20HolderInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "deployedToken"
      | "deposit"
      | "erdstall"
      | "foreignAssets"
      | "registerMetadata"
      | "template"
      | "transfer"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "ForeignAssetContractDeployed"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "deployedToken",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "erdstall", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "foreignAssets",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "registerMetadata",
    values: [BytesLike, string, string, BigNumberish, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "template", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [BigNumberish, BytesLike, AddressLike, BigNumberish[]]
  ): string;

  decodeFunctionResult(
    functionFragment: "deployedToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "erdstall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "foreignAssets",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "template", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
}

export namespace ForeignAssetContractDeployedEvent {
  export type InputTuple = [
    addr: AddressLike,
    origin: BigNumberish,
    localID: BytesLike
  ];
  export type OutputTuple = [addr: string, origin: bigint, localID: string];
  export interface OutputObject {
    addr: string;
    origin: bigint;
    localID: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ERC20Holder extends BaseContract {
  connect(runner?: ContractRunner | null): ERC20Holder;
  waitForDeployment(): Promise<this>;

  interface: ERC20HolderInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  deployedToken: TypedContractMethod<
    [origin_: BigNumberish, localID: BytesLike],
    [string],
    "view"
  >;

  deposit: TypedContractMethod<
    [token: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  erdstall: TypedContractMethod<[], [string], "view">;

  foreignAssets: TypedContractMethod<
    [arg0: AddressLike],
    [[string, bigint] & { localID: string; origin: bigint }],
    "view"
  >;

  registerMetadata: TypedContractMethod<
    [
      assetHash: BytesLike,
      name: string,
      symbol: string,
      decimals: BigNumberish,
      sig: BytesLike,
      certificate: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  template: TypedContractMethod<[], [string], "view">;

  transfer: TypedContractMethod<
    [
      origin: BigNumberish,
      localID: BytesLike,
      recipient: AddressLike,
      value: BigNumberish[]
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "deployedToken"
  ): TypedContractMethod<
    [origin_: BigNumberish, localID: BytesLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "deposit"
  ): TypedContractMethod<
    [token: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "erdstall"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "foreignAssets"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [[string, bigint] & { localID: string; origin: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "registerMetadata"
  ): TypedContractMethod<
    [
      assetHash: BytesLike,
      name: string,
      symbol: string,
      decimals: BigNumberish,
      sig: BytesLike,
      certificate: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "template"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "transfer"
  ): TypedContractMethod<
    [
      origin: BigNumberish,
      localID: BytesLike,
      recipient: AddressLike,
      value: BigNumberish[]
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "ForeignAssetContractDeployed"
  ): TypedContractEvent<
    ForeignAssetContractDeployedEvent.InputTuple,
    ForeignAssetContractDeployedEvent.OutputTuple,
    ForeignAssetContractDeployedEvent.OutputObject
  >;

  filters: {
    "ForeignAssetContractDeployed(address,uint16,bytes32)": TypedContractEvent<
      ForeignAssetContractDeployedEvent.InputTuple,
      ForeignAssetContractDeployedEvent.OutputTuple,
      ForeignAssetContractDeployedEvent.OutputObject
    >;
    ForeignAssetContractDeployed: TypedContractEvent<
      ForeignAssetContractDeployedEvent.InputTuple,
      ForeignAssetContractDeployedEvent.OutputTuple,
      ForeignAssetContractDeployedEvent.OutputObject
    >;
  };
}
