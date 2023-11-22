/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
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
        name: "amount",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
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
  "0x60806040523480156200001157600080fd5b50604051806040016040528060078152602001660546573742032360cc1b815250604051806040016040528060038152602001621514d560ea1b81525081600390816200005f91906200011c565b5060046200006e82826200011c565b505050620001e8565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620000a257607f821691505b602082108103620000c357634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200011757600081815260208120601f850160051c81016020861015620000f25750805b601f850160051c820191505b818110156200011357828155600101620000fe565b5050505b505050565b81516001600160401b0381111562000138576200013862000077565b62000150816200014984546200008d565b84620000c9565b602080601f8311600181146200018857600084156200016f5750858301515b600019600386901b1c1916600185901b17855562000113565b600085815260208120601f198616915b82811015620001b95788860151825594840194600190910190840162000198565b5085821015620001d85787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b610f6b80620001f86000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806340c10f1911610097578063a457c2d711610066578063a457c2d7146101fb578063a9059cbb1461020e578063d826f88f14610221578063dd62ed3e1461023057600080fd5b806340c10f191461019757806354ed9e32146101aa57806370a08231146101bd57806395d89b41146101f357600080fd5b806321175b4a116100d357806321175b4a1461014d57806323b872dd14610162578063313ce56714610175578063395093511461018457600080fd5b806306fdde03146100fa578063095ea7b31461011857806318160ddd1461013b575b600080fd5b610102610276565b60405161010f9190610ca7565b60405180910390f35b61012b610126366004610d3c565b610308565b604051901515815260200161010f565b6002545b60405190815260200161010f565b61016061015b366004610d75565b610322565b005b61012b610170366004610d90565b610390565b6040516012815260200161010f565b61012b610192366004610d3c565b6103f4565b6101606101a5366004610d3c565b610440565b6101606101b8366004610dcc565b61044e565b61013f6101cb366004610e10565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6101026104de565b61012b610209366004610d3c565b6104ed565b61012b61021c366004610d3c565b6105ce565b61016060006006819055600855565b61013f61023e366004610e2b565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b60606003805461028590610e5e565b80601f01602080910402602001604051908101604052809291908181526020018280546102b190610e5e565b80156102fe5780601f106102d3576101008083540402835291602001916102fe565b820191906000526020600020905b8154815290600101906020018083116102e157829003601f168201915b5050505050905090565b60003361031681858561062e565b60019150505b92915050565b60006006557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600855600780548291907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561038857610388610eb1565b021790555050565b60008061039b6107e1565b905060018160058111156103b1576103b1610eb1565b036103c05760009150506103ed565b60028160058111156103d4576103d4610eb1565b036103de57600080fd5b6103e9858585610847565b9150505b9392505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909190610316908290869061043b908790610f0f565b61062e565b61044a8282610860565b5050565b600580548591907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001838381111561048a5761048a610eb1565b02179055506006839055600780548391907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660018360058111156104d1576104d1610eb1565b0217905550600855505050565b60606004805461028590610e5e565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909190838110156105b6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6105c3828686840361062e565b506001949350505050565b6000806105d96107e1565b905060018160058111156105ef576105ef610eb1565b036105fe57600091505061031c565b600281600581111561061257610612610eb1565b0361061c57600080fd5b6106268484610953565b91505061031c565b73ffffffffffffffffffffffffffffffffffffffff83166106d0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016105ad565b73ffffffffffffffffffffffffffffffffffffffff8216610773576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f737300000000000000000000000000000000000000000000000000000000000060648201526084016105ad565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b600060065460000361082457600854600003610801575060055460ff1690565b6001600860008282546108149190610f22565b909155505060075460ff16919050565b6001600660008282546108379190610f22565b909155505060055460ff16919050565b600033610855858285610961565b6105c3858585610a38565b73ffffffffffffffffffffffffffffffffffffffff82166108dd576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016105ad565b80600260008282546108ef9190610f0f565b909155505073ffffffffffffffffffffffffffffffffffffffff8216600081815260208181526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b600033610316818585610a38565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610a325781811015610a25576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016105ad565b610a32848484840361062e565b50505050565b73ffffffffffffffffffffffffffffffffffffffff8316610adb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f647265737300000000000000000000000000000000000000000000000000000060648201526084016105ad565b73ffffffffffffffffffffffffffffffffffffffff8216610b7e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f657373000000000000000000000000000000000000000000000000000000000060648201526084016105ad565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610c34576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e6365000000000000000000000000000000000000000000000000000060648201526084016105ad565b73ffffffffffffffffffffffffffffffffffffffff848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3610a32565b600060208083528351808285015260005b81811015610cd457858101830151858201604001528201610cb8565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8301168501019250505092915050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610d3757600080fd5b919050565b60008060408385031215610d4f57600080fd5b610d5883610d13565b946020939093013593505050565b803560068110610d3757600080fd5b600060208284031215610d8757600080fd5b6103ed82610d66565b600080600060608486031215610da557600080fd5b610dae84610d13565b9250610dbc60208501610d13565b9150604084013590509250925092565b60008060008060808587031215610de257600080fd5b610deb85610d66565b935060208501359250610e0060408601610d66565b9396929550929360600135925050565b600060208284031215610e2257600080fd5b6103ed82610d13565b60008060408385031215610e3e57600080fd5b610e4783610d13565b9150610e5560208401610d13565b90509250929050565b600181811c90821680610e7257607f821691505b602082108103610eab577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b8082018082111561031c5761031c610ee0565b8181038181111561031c5761031c610ee056fea2646970667358221220a25c2bdda9a1c5de61119519b6b8c0bf818c35905b9a557065aff8fbd1e14e3464736f6c63430008130033";

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

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC20TestToken> {
    return super.deploy(overrides || {}) as Promise<ERC20TestToken>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC20TestToken {
    return super.attach(address) as ERC20TestToken;
  }
  override connect(signer: Signer): ERC20TestToken__factory {
    return super.connect(signer) as ERC20TestToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20TestTokenInterface {
    return new utils.Interface(_abi) as ERC20TestTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20TestToken {
    return new Contract(address, _abi, signerOrProvider) as ERC20TestToken;
  }
}