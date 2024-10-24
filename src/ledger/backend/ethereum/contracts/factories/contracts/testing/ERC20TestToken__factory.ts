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
import type { NonPayableOverrides } from "../../../common";
import type {
  ERC20TestToken,
  ERC20TestTokenInterface,
} from "../../../contracts/testing/ERC20TestToken";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
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
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051806040016040528060078152602001660546573742032360cc1b815250604051806040016040528060038152602001621514d560ea1b81525081600390816200005f91906200011e565b5060046200006e82826200011e565b505050620001ea565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620000a257607f821691505b602082108103620000c357634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111562000119576000816000526020600020601f850160051c81016020861015620000f45750805b601f850160051c820191505b81811015620001155782815560010162000100565b5050505b505050565b81516001600160401b038111156200013a576200013a62000077565b62000152816200014b84546200008d565b84620000c9565b602080601f8311600181146200018a5760008415620001715750858301515b600019600386901b1c1916600185901b17855562000115565b600085815260208120601f198616915b82811015620001bb578886015182559484019460019091019084016200019a565b5085821015620001da5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b610cf980620001fa6000396000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c806340c10f191161008c57806395d89b411161006657806395d89b41146101ca578063a9059cbb146101d2578063d826f88f146101e5578063dd62ed3e146101f457600080fd5b806340c10f191461016e57806354ed9e321461018157806370a082311461019457600080fd5b806321175b4a116100bd57806321175b4a1461013757806323b872dd1461014c578063313ce5671461015f57600080fd5b806306fdde03146100e4578063095ea7b31461010257806318160ddd14610125575b600080fd5b6100ec61023a565b6040516100f99190610a34565b60405180910390f35b610115610110366004610aca565b6102cc565b60405190151581526020016100f9565b6002545b6040519081526020016100f9565b61014a610145366004610b03565b6102e6565b005b61011561015a366004610b1e565b610354565b604051601281526020016100f9565b61014a61017c366004610aca565b6103b8565b61014a61018f366004610b5a565b6103c6565b6101296101a2366004610b9e565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6100ec610456565b6101156101e0366004610aca565b610465565b61014a60006006819055600855565b610129610202366004610bb9565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b60606003805461024990610bec565b80601f016020809104026020016040519081016040528092919081815260200182805461027590610bec565b80156102c25780601f10610297576101008083540402835291602001916102c2565b820191906000526020600020905b8154815290600101906020018083116102a557829003601f168201915b5050505050905090565b6000336102da8185856104c5565b60019150505b92915050565b60006006557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600855600780548291907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561034c5761034c610c3f565b021790555050565b60008061035f6104d7565b9050600181600581111561037557610375610c3f565b036103845760009150506103b1565b600281600581111561039857610398610c3f565b036103a257600080fd5b6103ad85858561053d565b9150505b9392505050565b6103c28282610561565b5050565b600580548591907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001838381111561040257610402610c3f565b02179055506006839055600780548391907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561044957610449610c3f565b0217905550600855505050565b60606004805461024990610bec565b6000806104706104d7565b9050600181600581111561048657610486610c3f565b036104955760009150506102e0565b60028160058111156104a9576104a9610c3f565b036104b357600080fd5b6104bd84846105c2565b9150506102e0565b6104d283838360016105d0565b505050565b600060065460000361051a576008546000036104f7575060055460ff1690565b60016008600082825461050a9190610c9d565b909155505060075460ff16919050565b60016006600082825461052d9190610c9d565b909155505060055460ff16919050565b60003361054b858285610719565b6105568585856107e2565b506001949350505050565b73ffffffffffffffffffffffffffffffffffffffff82166105b6576040517fec442f05000000000000000000000000000000000000000000000000000000008152600060048201526024015b60405180910390fd5b6103c260008383610889565b6000336102da8185856107e2565b73ffffffffffffffffffffffffffffffffffffffff8416610620576040517fe602df05000000000000000000000000000000000000000000000000000000008152600060048201526024016105ad565b73ffffffffffffffffffffffffffffffffffffffff8316610670576040517f94280d62000000000000000000000000000000000000000000000000000000008152600060048201526024016105ad565b73ffffffffffffffffffffffffffffffffffffffff80851660009081526001602090815260408083209387168352929052208290558015610713578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161070a91815260200190565b60405180910390a35b50505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff811461071357818110156107d3576040517ffb8f41b200000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8416600482015260248101829052604481018390526064016105ad565b610713848484840360006105d0565b73ffffffffffffffffffffffffffffffffffffffff8316610832576040517f96c6fd1e000000000000000000000000000000000000000000000000000000008152600060048201526024016105ad565b73ffffffffffffffffffffffffffffffffffffffff8216610882576040517fec442f05000000000000000000000000000000000000000000000000000000008152600060048201526024016105ad565b6104d28383835b73ffffffffffffffffffffffffffffffffffffffff83166108c15780600260008282546108b69190610cb0565b909155506109739050565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610947576040517fe450d38c00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8516600482015260248101829052604481018390526064016105ad565b73ffffffffffffffffffffffffffffffffffffffff841660009081526020819052604090209082900390555b73ffffffffffffffffffffffffffffffffffffffff821661099c576002805482900390556109c8565b73ffffffffffffffffffffffffffffffffffffffff821660009081526020819052604090208054820190555b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a2791815260200190565b60405180910390a3505050565b60006020808352835180602085015260005b81811015610a6257858101830151858201604001528201610a46565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8301168501019250505092915050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610ac557600080fd5b919050565b60008060408385031215610add57600080fd5b610ae683610aa1565b946020939093013593505050565b803560068110610ac557600080fd5b600060208284031215610b1557600080fd5b6103b182610af4565b600080600060608486031215610b3357600080fd5b610b3c84610aa1565b9250610b4a60208501610aa1565b9150604084013590509250925092565b60008060008060808587031215610b7057600080fd5b610b7985610af4565b935060208501359250610b8e60408601610af4565b9396929550929360600135925050565b600060208284031215610bb057600080fd5b6103b182610aa1565b60008060408385031215610bcc57600080fd5b610bd583610aa1565b9150610be360208401610aa1565b90509250929050565b600181811c90821680610c0057607f821691505b602082108103610c39577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b818103818111156102e0576102e0610c6e565b808201808211156102e0576102e0610c6e56fea26469706673582212207b1dee2484f22725a1d8dc96badab3d8e4e2d11a2e75e8ff3592681e6545c83d64736f6c63430008180033";

type ERC20TestTokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20TestTokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20TestToken__factory extends ContractFactory {
  constructor(...args: ERC20TestTokenConstructorParams) {
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
      ERC20TestToken & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ERC20TestToken__factory {
    return super.connect(runner) as ERC20TestToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20TestTokenInterface {
    return new Interface(_abi) as ERC20TestTokenInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ERC20TestToken {
    return new Contract(address, _abi, runner) as unknown as ERC20TestToken;
  }
}
