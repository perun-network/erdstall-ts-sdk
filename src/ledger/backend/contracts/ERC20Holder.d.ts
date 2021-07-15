/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface ERC20HolderInterface extends ethers.utils.Interface {
  functions: {
    "deposit(address,uint256)": FunctionFragment;
    "erdstall()": FunctionFragment;
    "mint(address,address,bytes)": FunctionFragment;
    "transfer(address,address,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "deposit",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "erdstall", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [string, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [string, string, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "erdstall", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;

  events: {};
}

export class ERC20Holder extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: ERC20HolderInterface;

  functions: {
    deposit(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "deposit(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    erdstall(overrides?: CallOverrides): Promise<[string]>;

    "erdstall()"(overrides?: CallOverrides): Promise<[string]>;

    mint(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "mint(address,address,bytes)"(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transfer(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "transfer(address,address,bytes)"(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  deposit(
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "deposit(address,uint256)"(
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  erdstall(overrides?: CallOverrides): Promise<string>;

  "erdstall()"(overrides?: CallOverrides): Promise<string>;

  mint(
    token: string,
    owner: string,
    value: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "mint(address,address,bytes)"(
    token: string,
    owner: string,
    value: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transfer(
    token: string,
    recipient: string,
    value: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "transfer(address,address,bytes)"(
    token: string,
    recipient: string,
    value: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    deposit(
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "deposit(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    erdstall(overrides?: CallOverrides): Promise<string>;

    "erdstall()"(overrides?: CallOverrides): Promise<string>;

    mint(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "mint(address,address,bytes)"(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    transfer(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "transfer(address,address,bytes)"(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    deposit(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "deposit(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    erdstall(overrides?: CallOverrides): Promise<BigNumber>;

    "erdstall()"(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "mint(address,address,bytes)"(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transfer(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "transfer(address,address,bytes)"(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    deposit(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "deposit(address,uint256)"(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    erdstall(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "erdstall()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    mint(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "mint(address,address,bytes)"(
      token: string,
      owner: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transfer(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "transfer(address,address,bytes)"(
      token: string,
      recipient: string,
      value: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
