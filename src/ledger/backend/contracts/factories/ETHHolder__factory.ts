/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ETHHolder, ETHHolderInterface } from "../ETHHolder";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "erdstall",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "erdstall",
    outputs: [
      {
        internalType: "contract Erdstall",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b506040516107b93803806107b983398101604081905261002f91610044565b60601b6001600160601b031916608052610072565b600060208284031215610055578081fd5b81516001600160a01b038116811461006b578182fd5b9392505050565b60805160601c61071d61009c60003960008181604b0152818160d80152610357015261071d6000f3fe6080604052600436106100345760003560e01c8063411f925c146100395780639e625f6c14610096578063d0e30db0146100b8575b600080fd5b34801561004557600080fd5b5061006d7f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f35b3480156100a257600080fd5b506100b66100b13660046105c3565b6100c0565b005b6100b6610274565b3373ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001614610164576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601960248201527f546f6b656e486f6c6465723a206e6f74204572647374616c6c0000000000000060448201526064015b60405180910390fd5b8373ffffffffffffffffffffffffffffffffffffffff811615610209576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f455448486f6c6465723a206e6f74207a65726f20746f6b656e2061646472657360448201527f7300000000000000000000000000000000000000000000000000000000000000606482015260840161015b565b600061024a84848080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506103c692505050565b905061026c73ffffffffffffffffffffffffffffffffffffffff86168261043b565b505050505050565b600034116102de576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f455448486f6c6465723a207a65726f2076616c75650000000000000000000000604482015260640161015b565b6040805134602082015260009101604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152908290527f46e6744b000000000000000000000000000000000000000000000000000000008252915073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016906346e6744b90610391903390600090869060040161064c565b600060405180830381600087803b1580156103ab57600080fd5b505af11580156103bf573d6000803e3d6000fd5b5050505050565b60008151602014610433576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f42797465733a206e6f74206c656e677468203332000000000000000000000000604482015260640161015b565b506020015190565b804710156104a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e6365000000604482015260640161015b565b60008273ffffffffffffffffffffffffffffffffffffffff168260405160006040518083038185875af1925050503d80600081146104ff576040519150601f19603f3d011682016040523d82523d6000602084013e610504565b606091505b5050905080610595576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d61792068617665207265766572746564000000000000606482015260840161015b565b505050565b803573ffffffffffffffffffffffffffffffffffffffff811681146105be57600080fd5b919050565b600080600080606085870312156105d8578384fd5b6105e18561059a565b93506105ef6020860161059a565b9250604085013567ffffffffffffffff8082111561060b578384fd5b818701915087601f83011261061e578384fd5b81358181111561062c578485fd5b88602082850101111561063d578485fd5b95989497505060200194505050565b600073ffffffffffffffffffffffffffffffffffffffff80861683526020818616818501526060604085015284519150816060850152825b828110156106a057858101820151858201608001528101610684565b828111156106b15783608084870101525b5050601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160800194935050505056fea26469706673582212200afcfaec72601335e2e1dae691f0d953f58e674775a82f7da32f7a1b19f4b82a64736f6c63430008040033";

export class ETHHolder__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    erdstall: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ETHHolder> {
    return super.deploy(erdstall, overrides || {}) as Promise<ETHHolder>;
  }
  getDeployTransaction(
    erdstall: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(erdstall, overrides || {});
  }
  attach(address: string): ETHHolder {
    return super.attach(address) as ETHHolder;
  }
  connect(signer: Signer): ETHHolder__factory {
    return super.connect(signer) as ETHHolder__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ETHHolderInterface {
    return new utils.Interface(_abi) as ETHHolderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ETHHolder {
    return new Contract(address, _abi, signerOrProvider) as ETHHolder;
  }
}
