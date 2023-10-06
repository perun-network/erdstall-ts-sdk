/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  ContractBasedUser,
  ContractBasedUserInterface,
} from "../../../contracts/testing/ContractBasedUser";

const _abi = [
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
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
    name: "approveERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC721",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approveERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ERC20Holder",
        name: "holder",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ERC721Holder",
        name: "holder",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
    ],
    name: "depositERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ETHHolder",
        name: "holder",
        type: "address",
      },
    ],
    name: "depositEth",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "setRedepositHolderAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610d31806100206000396000f3fe6080604052600436106100b45760003560e01c806354ed9e3211610069578063ad9d4ba31161004e578063ad9d4ba3146102ab578063d826f88f146102be578063efcc7b38146102da5761016c565b806354ed9e321461026b578063a8e5e4aa1461028b5761016c565b80631cad5a401161009a5780631cad5a401461020b5780631e6c7ee21461022b57806321175b4a1461024b5761016c565b8062a7230a14610196578063150b7a02146101b65761016c565b3661016c5760006100c361033c565b905060028160058111156100d9576100d96108fc565b036100e357600080fd5b60048160058111156100f7576100f76108fc565b0361016a5760055473ffffffffffffffffffffffffffffffffffffffff1663d0e30db061012560023461092b565b6040518263ffffffff1660e01b81526004016000604051808303818588803b15801561015057600080fd5b505af1158015610164573d6000803e3d6000fd5b50505050505b005b600061017661033c565b9050600281600581111561018c5761018c6108fc565b0361016a57600080fd5b3480156101a257600080fd5b5061016a6101b136600461098b565b6103a1565b3480156101c257600080fd5b506101d66101d13660046109cc565b61042f565b6040517fffffffff00000000000000000000000000000000000000000000000000000000909116815260200160405180910390f35b34801561021757600080fd5b5061016a61022636600461098b565b61060f565b34801561023757600080fd5b5061016a610246366004610a6b565b61066a565b34801561025757600080fd5b5061016a610266366004610b14565b6106f8565b34801561027757600080fd5b5061016a610286366004610b36565b610768565b34801561029757600080fd5b5061016a6102a636600461098b565b6107f9565b61016a6102b9366004610b7a565b610898565b3480156102ca57600080fd5b5061016a60006001819055600355565b3480156102e657600080fd5b5061016a6102f5366004610b7a565b600580547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b600060015460000361037f5760035460000361035c575060005460ff1690565b60016003600082825461036f9190610b97565b909155505060025460ff16919050565b60018060008282546103919190610b97565b909155505060005460ff16919050565b6040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff83811660048301526024820183905284169063095ea7b3906044015b600060405180830381600087803b15801561041257600080fd5b505af1158015610426573d6000803e3d6000fd5b50505050505050565b60008061043a61033c565b90506003816005811115610450576104506108fc565b0361045a57600080fd5b600581600581111561046e5761046e6108fc565b036105e3576005546040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff9091166004820152602481018690523390819063095ea7b390604401600060405180830381600087803b1580156104e757600080fd5b505af11580156104fb573d6000803e3d6000fd5b50600092506001915061050b9050565b604051908082528060200260200182016040528015610534578160200160208202803683370190505b509050868160008151811061054b5761054b610bd7565b60209081029190910101526005546040517fa71604e800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff9091169063a71604e8906105ae9085908590600401610c06565b600060405180830381600087803b1580156105c857600080fd5b505af11580156105dc573d6000803e3d6000fd5b5050505050505b507f150b7a02000000000000000000000000000000000000000000000000000000009695505050505050565b6040517f47e7ef2400000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8381166004830152602482018390528416906347e7ef24906044016103f8565b6040517fa71604e800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff85169063a71604e8906106c090869086908690600401610c6a565b600060405180830381600087803b1580156106da57600080fd5b505af11580156106ee573d6000803e3d6000fd5b5050505050505050565b600060019081557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6003556002805483927fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0090911690836005811115610760576107606108fc565b021790555050565b600080548591907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660018360058111156107a5576107a56108fc565b021790555060018381556002805484927fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00909116908360058111156107ec576107ec6108fc565b0217905550600355505050565b6040517f095ea7b300000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff83811660048301526024820183905284169063095ea7b3906044016020604051808303816000875af115801561086e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108929190610cd9565b50505050565b8073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0346040518263ffffffff1660e01b81526004016000604051808303818588803b1580156108e057600080fd5b505af11580156108f4573d6000803e3d6000fd5b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600082610961577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b73ffffffffffffffffffffffffffffffffffffffff8116811461098857600080fd5b50565b6000806000606084860312156109a057600080fd5b83356109ab81610966565b925060208401356109bb81610966565b929592945050506040919091013590565b6000806000806000608086880312156109e457600080fd5b85356109ef81610966565b945060208601356109ff81610966565b935060408601359250606086013567ffffffffffffffff80821115610a2357600080fd5b818801915088601f830112610a3757600080fd5b813581811115610a4657600080fd5b896020828501011115610a5857600080fd5b9699959850939650602001949392505050565b60008060008060608587031215610a8157600080fd5b8435610a8c81610966565b93506020850135610a9c81610966565b9250604085013567ffffffffffffffff80821115610ab957600080fd5b818701915087601f830112610acd57600080fd5b813581811115610adc57600080fd5b8860208260051b8501011115610af157600080fd5b95989497505060200194505050565b803560068110610b0f57600080fd5b919050565b600060208284031215610b2657600080fd5b610b2f82610b00565b9392505050565b60008060008060808587031215610b4c57600080fd5b610b5585610b00565b935060208501359250610b6a60408601610b00565b9396929550929360600135925050565b600060208284031215610b8c57600080fd5b8135610b2f81610966565b81810381811115610bd1577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60006040820173ffffffffffffffffffffffffffffffffffffffff851683526020604081850152818551808452606086019150828701935060005b81811015610c5d57845183529383019391830191600101610c41565b5090979650505050505050565b73ffffffffffffffffffffffffffffffffffffffff841681526040602082015281604082015260007f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831115610cbf57600080fd5b8260051b8085606085013791909101606001949350505050565b600060208284031215610ceb57600080fd5b81518015158114610b2f57600080fdfea264697066735822122003b51701a9503542c5ca71b5cd24bdf31b2c85d9fbbbe13dcac9842c6be9807f64736f6c63430008130033";

type ContractBasedUserConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ContractBasedUserConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ContractBasedUser__factory extends ContractFactory {
  constructor(...args: ContractBasedUserConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractBasedUser> {
    return super.deploy(overrides || {}) as Promise<ContractBasedUser>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ContractBasedUser {
    return super.attach(address) as ContractBasedUser;
  }
  override connect(signer: Signer): ContractBasedUser__factory {
    return super.connect(signer) as ContractBasedUser__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ContractBasedUserInterface {
    return new utils.Interface(_abi) as ContractBasedUserInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ContractBasedUser {
    return new Contract(address, _abi, signerOrProvider) as ContractBasedUser;
  }
}
