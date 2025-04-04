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
  ForeignERC20,
  ForeignERC20Interface,
} from "../../../contracts/ForeignERC20.sol/ForeignERC20";

const _abi = [
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
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
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
  {
    inputs: [],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8",
      },
    ],
    name: "initMetadata",
    outputs: [],
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
        name: "value",
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
        name: "value",
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
  "0x608060405234801561001057600080fd5b50604080516020808201835260008083528351918201909352828152825460ff191660011790925590600461004583826100f9565b50600561005282826100f9565b5050506101b7565b634e487b7160e01b600052604160045260246000fd5b600181811c9082168061008457607f821691505b6020821081036100a457634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156100f457806000526020600020601f840160051c810160208510156100d15750805b601f840160051c820191505b818110156100f157600081556001016100dd565b50505b505050565b81516001600160401b038111156101125761011261005a565b610126816101208454610070565b846100aa565b6020601f82116001811461015a57600083156101425750848201515b600019600385901b1c1916600184901b1784556100f1565b600084815260208120601f198516915b8281101561018a578785015182556020948501946001909201910161016a565b50848210156101a85786840151600019600387901b60f8161c191681555b50505050600190811b01905550565b610e53806101c66000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806395d89b411161008c578063a9059cbb11610066578063a9059cbb146101db578063dd62ed3e146101ee578063e1c7392a14610227578063e534155d1461022f57600080fd5b806395d89b41146101ad5780639dc29fac146101b55780639eee6484146101c857600080fd5b806323b872dd116100c857806323b872dd14610142578063313ce5671461015557806340c10f191461016f57806370a082311461018457600080fd5b806306fdde03146100ef578063095ea7b31461010d57806318160ddd14610130575b600080fd5b6100f761025f565b6040516101049190610aa7565b60405180910390f35b61012061011b366004610b11565b610301565b6040519015158152602001610104565b6003545b604051908152602001610104565b610120610150366004610b3b565b61031b565b61015d61033f565b60405160ff9091168152602001610104565b61018261017d366004610b11565b61035b565b005b610134610192366004610b78565b6001600160a01b031660009081526001602052604090205490565b6100f7610411565b6101826101c3366004610b11565b610430565b6101826101d6366004610be3565b6104dd565b6101206101e9366004610b11565b610594565b6101346101fc366004610c72565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b6101826105a2565b6000546102479061010090046001600160a01b031681565b6040516001600160a01b039091168152602001610104565b60065460609060ff1661027157600080fd5b6007805461027e90610ca5565b80601f01602080910402602001604051908101604052809291908181526020018280546102aa90610ca5565b80156102f75780601f106102cc576101008083540402835291602001916102f7565b820191906000526020600020905b8154815290600101906020018083116102da57829003601f168201915b5050505050905090565b60003361030f818585610600565b60019150505b92915050565b600033610329858285610612565b6103348585856106aa565b506001949350505050565b60065460009060ff1661035157600080fd5b5060095460ff1690565b60005460ff166103a45760405162461bcd60e51b815260206004820152600f60248201526e139bdd081a5b9a5d1a585b1a5e9959608a1b60448201526064015b60405180910390fd5b60005461010090046001600160a01b031633146104035760405162461bcd60e51b815260206004820152601360248201527f4f6e6c7920686f6c64657220616c6c6f77656400000000000000000000000000604482015260640161039b565b61040d8282610709565b5050565b60065460609060ff1661042357600080fd5b6008805461027e90610ca5565b60005460ff166104745760405162461bcd60e51b815260206004820152600f60248201526e139bdd081a5b9a5d1a585b1a5e9959608a1b604482015260640161039b565b60005461010090046001600160a01b031633146104d35760405162461bcd60e51b815260206004820152601360248201527f4f6e6c7920686f6c64657220616c6c6f77656400000000000000000000000000604482015260640161039b565b61040d828261073f565b60005460ff166105215760405162461bcd60e51b815260206004820152600f60248201526e139bdd081a5b9a5d1a585b1a5e9959608a1b604482015260640161039b565b60005461010090046001600160a01b031633146105805760405162461bcd60e51b815260206004820152601360248201527f4f6e6c7920686f6c64657220616c6c6f77656400000000000000000000000000604482015260640161039b565b61058d8585858585610775565b5050505050565b60003361030f8185856106aa565b60005460ff16156105f55760405162461bcd60e51b815260206004820152601360248201527f416c726561647920496e697469616c697a656400000000000000000000000000604482015260640161039b565b6105fe336107c8565b565b61060d838383600161085d565b505050565b6001600160a01b038381166000908152600260209081526040808320938616835292905220546000198110156106a45781811015610695576040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526001600160a01b0384166004820152602481018290526044810183905260640161039b565b6106a48484848403600061085d565b50505050565b6001600160a01b0383166106d457604051634b637e8f60e11b81526000600482015260240161039b565b6001600160a01b0382166106fe5760405163ec442f0560e01b81526000600482015260240161039b565b61060d838383610964565b6001600160a01b0382166107335760405163ec442f0560e01b81526000600482015260240161039b565b61040d60008383610964565b6001600160a01b03821661076957604051634b637e8f60e11b81526000600482015260240161039b565b61040d82600083610964565b60065460ff161561078557600080fd5b6006805460ff19166001179055600761079f858783610d3c565b5060086107ad838583610d3c565b506009805460ff191660ff9290921691909117905550505050565b60005460ff161561081b5760405162461bcd60e51b815260206004820152601360248201527f416c726561647920496e697469616c697a656400000000000000000000000000604482015260640161039b565b600080546001600160a01b03909216610100027fffffffffffffffffffffff000000000000000000000000000000000000000000909216919091176001179055565b6001600160a01b0384166108a0576040517fe602df050000000000000000000000000000000000000000000000000000000081526000600482015260240161039b565b6001600160a01b0383166108e3576040517f94280d620000000000000000000000000000000000000000000000000000000081526000600482015260240161039b565b6001600160a01b03808516600090815260026020908152604080832093871683529290522082905580156106a457826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161095691815260200190565b60405180910390a350505050565b6001600160a01b03831661098f5780600360008282546109849190610dfc565b90915550610a1a9050565b6001600160a01b038316600090815260016020526040902054818110156109fb576040517fe450d38c0000000000000000000000000000000000000000000000000000000081526001600160a01b0385166004820152602481018290526044810183905260640161039b565b6001600160a01b03841660009081526001602052604090209082900390555b6001600160a01b038216610a3657600380548290039055610a55565b6001600160a01b03821660009081526001602052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a9a91815260200190565b60405180910390a3505050565b602081526000825180602084015260005b81811015610ad55760208186018101516040868401015201610ab8565b506000604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b0381168114610b0c57600080fd5b919050565b60008060408385031215610b2457600080fd5b610b2d83610af5565b946020939093013593505050565b600080600060608486031215610b5057600080fd5b610b5984610af5565b9250610b6760208501610af5565b929592945050506040919091013590565b600060208284031215610b8a57600080fd5b610b9382610af5565b9392505050565b60008083601f840112610bac57600080fd5b50813567ffffffffffffffff811115610bc457600080fd5b602083019150836020828501011115610bdc57600080fd5b9250929050565b600080600080600060608688031215610bfb57600080fd5b853567ffffffffffffffff811115610c1257600080fd5b610c1e88828901610b9a565b909650945050602086013567ffffffffffffffff811115610c3e57600080fd5b610c4a88828901610b9a565b909450925050604086013560ff81168114610c6457600080fd5b809150509295509295909350565b60008060408385031215610c8557600080fd5b610c8e83610af5565b9150610c9c60208401610af5565b90509250929050565b600181811c90821680610cb957607f821691505b602082108103610cd957634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b601f82111561060d57806000526020600020601f840160051c81016020851015610d1c5750805b601f840160051c820191505b8181101561058d5760008155600101610d28565b67ffffffffffffffff831115610d5457610d54610cdf565b610d6883610d628354610ca5565b83610cf5565b6000601f841160018114610d9c5760008515610d845750838201355b600019600387901b1c1916600186901b17835561058d565b600083815260209020601f19861690835b82811015610dcd5786850135825560209485019460019092019101610dad565b5086821015610dea5760001960f88860031b161c19848701351681555b505060018560011b0183555050505050565b8082018082111561031557634e487b7160e01b600052601160045260246000fdfea2646970667358221220cb9b0dfc89c00a1f69e3efe5d1d3302c70ef11ada08d84eff0de2ddf2ac8619164736f6c634300081b0033";

type ForeignERC20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ForeignERC20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ForeignERC20__factory extends ContractFactory {
  constructor(...args: ForeignERC20ConstructorParams) {
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
      ForeignERC20 & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ForeignERC20__factory {
    return super.connect(runner) as ForeignERC20__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ForeignERC20Interface {
    return new Interface(_abi) as ForeignERC20Interface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ForeignERC20 {
    return new Contract(address, _abi, runner) as unknown as ForeignERC20;
  }
}
