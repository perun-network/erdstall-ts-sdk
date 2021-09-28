/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { RevertToken, RevertTokenInterface } from "../RevertToken";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_baseURI",
        type: "string",
      },
      {
        internalType: "address[]",
        name: "_minters",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_revertModulus",
        type: "uint256",
      },
    ],
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
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
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
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
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
        name: "_minter",
        type: "address",
      },
    ],
    name: "addMinter",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
        name: "id",
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
    name: "owner",
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
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
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
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60c06040523480156200001157600080fd5b5060405162002626380380620026268339810160408190526200003491620004e1565b6040518060400160405280600681526020016514995d995c9d60d21b8152506040518060400160405280600381526020016214959560ea1b8152508484838381600090805190602001906200008b9291906200039b565b508051620000a19060019060208401906200039b565b5050506000620000c7306001600160a01b031660146200019c60201b62000c871760201c565b90508281604051602001620000de929190620005ab565b60405160208183030381529060405260069080519060200190620001049291906200039b565b503360601b60805260005b825181101562000187576001600760008584815181106200014057634e487b7160e01b600052603260045260246000fd5b6020908102919091018101516001600160a01b03168252810191909152604001600020805460ff1916911515919091179055806200017e81620006e4565b9150506200010f565b50505060a093909352506200072e9350505050565b60606000620001ad83600262000638565b620001ba9060026200061d565b6001600160401b03811115620001e057634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f1916602001820160405280156200020b576020820181803683370190505b509050600360fc1b816000815181106200023557634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106200027357634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535060006200029984600262000638565b620002a69060016200061d565b90505b600181111562000340576f181899199a1a9b1b9c1cb0b131b232b360811b85600f1660108110620002ea57634e487b7160e01b600052603260045260246000fd5b1a60f81b8282815181106200030f57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535060049490941c9362000338816200068d565b9050620002a9565b508315620003945760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e74604482015260640160405180910390fd5b9392505050565b828054620003a990620006a7565b90600052602060002090601f016020900481019282620003cd576000855562000418565b82601f10620003e857805160ff191683800117855562000418565b8280016001018555821562000418579182015b8281111562000418578251825591602001919060010190620003fb565b50620004269291506200042a565b5090565b5b808211156200042657600081556001016200042b565b600082601f83011262000452578081fd5b815160206001600160401b0382111562000470576200047062000718565b8160051b62000481828201620005ea565b8381528281019086840183880185018910156200049c578687fd5b8693505b85841015620004d55780516001600160a01b0381168114620004c0578788fd5b835260019390930192918401918401620004a0565b50979650505050505050565b600080600060608486031215620004f6578283fd5b83516001600160401b03808211156200050d578485fd5b818601915086601f83011262000521578485fd5b81518181111562000536576200053662000718565b6200054b601f8201601f1916602001620005ea565b81815288602083860101111562000560578687fd5b620005738260208301602087016200065a565b6020880151909650925050808211156200058b578384fd5b506200059a8682870162000441565b925050604084015190509250925092565b60008351620005bf8184602088016200065a565b835190830190620005d58183602088016200065a565b602f60f81b9101908152600101949350505050565b604051601f8201601f191681016001600160401b038111828210171562000615576200061562000718565b604052919050565b6000821982111562000633576200063362000702565b500190565b600081600019048311821515161562000655576200065562000702565b500290565b60005b83811015620006775781810151838201526020016200065d565b8381111562000687576000848401525b50505050565b6000816200069f576200069f62000702565b506000190190565b600181811c90821680620006bc57607f821691505b60208210811415620006de57634e487b7160e01b600052602260045260246000fd5b50919050565b6000600019821415620006fb57620006fb62000702565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b60805160601c60a051611ec86200075e6000396000610741015260008181610201015261094a0152611ec86000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c806370a0823111610097578063a22cb46511610066578063a22cb4651461023e578063b88d4fde14610251578063c87b56dd14610264578063e985e9c51461027757600080fd5b806370a08231146101db5780638da5cb5b146101fc57806395d89b4114610223578063983b2d561461022b57600080fd5b806323b872dd116100d357806323b872dd1461018f57806340c10f19146101a257806342842e0e146101b55780636352211e146101c857600080fd5b806301ffc9a71461010557806306fdde031461012d578063081812fc14610142578063095ea7b31461017a575b600080fd5b610118610113366004611b2d565b6102c0565b60405190151581526020015b60405180910390f35b6101356103a5565b6040516101249190611c3f565b610155610150366004611b65565b610437565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610124565b61018d610188366004611b04565b6104fc565b005b61018d61019d36600461199c565b610655565b61018d6101b0366004611b04565b6106dc565b61018d6101c336600461199c565b6107bc565b6101556101d6366004611b65565b6107d7565b6101ee6101e9366004611950565b61086f565b604051908152602001610124565b6101557f000000000000000000000000000000000000000000000000000000000000000081565b610135610923565b61018d610239366004611950565b610932565b61018d61024c366004611aca565b610a06565b61018d61025f3660046119d7565b610b03565b610135610272366004611b65565b610b91565b61011861028536600461196a565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260056020908152604080832093909416825291909152205460ff1690565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f80ac58cd00000000000000000000000000000000000000000000000000000000148061035357507fffffffff0000000000000000000000000000000000000000000000000000000082167f5b5e139f00000000000000000000000000000000000000000000000000000000145b8061039f57507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b6060600080546103b490611d33565b80601f01602080910402602001604051908101604052809291908181526020018280546103e090611d33565b801561042d5780601f106104025761010080835404028352916020019161042d565b820191906000526020600020905b81548152906001019060200180831161041057829003601f168201915b5050505050905090565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff166104d35760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084015b60405180910390fd5b5060009081526004602052604090205473ffffffffffffffffffffffffffffffffffffffff1690565b6000610507826107d7565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156105ab5760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f720000000000000000000000000000000000000000000000000000000000000060648201526084016104ca565b3373ffffffffffffffffffffffffffffffffffffffff821614806105d457506105d48133610285565b6106465760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c000000000000000060648201526084016104ca565b6106508383610f73565b505050565b61065f3382611013565b6106d15760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016104ca565b610650838383611169565b3360009081526007602052604090205460ff1661073b5760405162461bcd60e51b815260206004820152601460248201527f506572756e4172743a206e6f74206d696e74657200000000000000000000000060448201526064016104ca565b806107667f000000000000000000000000000000000000000000000000000000000000000082611dc0565b6107b25760405162461bcd60e51b815260206004820152600960248201527f726576657274206964000000000000000000000000000000000000000000000060448201526064016104ca565b610650838361139c565b61065083838360405180602001604052806000815250610b03565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff168061039f5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e000000000000000000000000000000000000000000000060648201526084016104ca565b600073ffffffffffffffffffffffffffffffffffffffff82166108fa5760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f20616464726573730000000000000000000000000000000000000000000060648201526084016104ca565b5073ffffffffffffffffffffffffffffffffffffffff1660009081526003602052604090205490565b6060600180546103b490611d33565b3373ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016146109b75760405162461bcd60e51b815260206004820152601360248201527f506572756e4172743a206e6f74206f776e65720000000000000000000000000060448201526064016104ca565b73ffffffffffffffffffffffffffffffffffffffff16600090815260076020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001179055565b73ffffffffffffffffffffffffffffffffffffffff8216331415610a6c5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c65720000000000000060448201526064016104ca565b33600081815260056020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b610b0d3383611013565b610b7f5760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016104ca565b610b8b8484848461152a565b50505050565b60008181526002602052604090205460609073ffffffffffffffffffffffffffffffffffffffff16610c2b5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201527f6e6578697374656e7420746f6b656e000000000000000000000000000000000060648201526084016104ca565b6000610c356115b3565b90506000815111610c555760405180602001604052806000815250610c80565b80610c5f846115c2565b604051602001610c70929190611bc7565b6040516020818303038152906040525b9392505050565b60606000610c96836002611c7e565b610ca1906002611c52565b67ffffffffffffffff811115610ce0577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015610d0a576020820181803683370190505b5090507f300000000000000000000000000000000000000000000000000000000000000081600081518110610d68577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f780000000000000000000000000000000000000000000000000000000000000081600181518110610df2577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506000610e2e846002611c7e565b610e39906001611c52565b90505b6001811115610f24577f303132333435363738396162636465660000000000000000000000000000000085600f1660108110610ea1577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b1a60f81b828281518110610ede577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060049490941c93610f1d81611cfe565b9050610e3c565b508315610c805760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016104ca565b600081815260046020526040902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091558190610fcd826107d7565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff166110aa5760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084016104ca565b60006110b5836107d7565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16148061112457508373ffffffffffffffffffffffffffffffffffffffff1661110c84610437565b73ffffffffffffffffffffffffffffffffffffffff16145b80611161575073ffffffffffffffffffffffffffffffffffffffff80821660009081526005602090815260408083209388168352929052205460ff165b949350505050565b8273ffffffffffffffffffffffffffffffffffffffff16611189826107d7565b73ffffffffffffffffffffffffffffffffffffffff16146112125760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201527f73206e6f74206f776e000000000000000000000000000000000000000000000060648201526084016104ca565b73ffffffffffffffffffffffffffffffffffffffff821661129a5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016104ca565b6112a5600082610f73565b73ffffffffffffffffffffffffffffffffffffffff831660009081526003602052604081208054600192906112db908490611cbb565b909155505073ffffffffffffffffffffffffffffffffffffffff82166000908152600360205260408120805460019290611316908490611c52565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff86811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b73ffffffffffffffffffffffffffffffffffffffff82166113ff5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016104ca565b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16156114715760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016104ca565b73ffffffffffffffffffffffffffffffffffffffff821660009081526003602052604081208054600192906114a7908490611c52565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b611535848484611169565b61154184848484611742565b610b8b5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016104ca565b6060600680546103b490611d33565b60608161160257505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561162c578061161681611d87565b91506116259050600a83611c6a565b9150611606565b60008167ffffffffffffffff81111561166e577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611698576020820181803683370190505b5090505b8415611161576116ad600183611cbb565b91506116ba600a86611dc0565b6116c5906030611c52565b60f81b818381518110611701577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535061173b600a86611c6a565b945061169c565b600073ffffffffffffffffffffffffffffffffffffffff84163b1561191c576040517f150b7a0200000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff85169063150b7a02906117b9903390899088908890600401611bf6565b602060405180830381600087803b1580156117d357600080fd5b505af1925050508015611821575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820190925261181e91810190611b49565b60015b6118d1573d80801561184f576040519150601f19603f3d011682016040523d82523d6000602084013e611854565b606091505b5080516118c95760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016104ca565b805181602001fd5b7fffffffff00000000000000000000000000000000000000000000000000000000167f150b7a0200000000000000000000000000000000000000000000000000000000149050611161565b506001949350505050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461194b57600080fd5b919050565b600060208284031215611961578081fd5b610c8082611927565b6000806040838503121561197c578081fd5b61198583611927565b915061199360208401611927565b90509250929050565b6000806000606084860312156119b0578081fd5b6119b984611927565b92506119c760208501611927565b9150604084013590509250925092565b600080600080608085870312156119ec578081fd5b6119f585611927565b9350611a0360208601611927565b925060408501359150606085013567ffffffffffffffff80821115611a26578283fd5b818701915087601f830112611a39578283fd5b813581811115611a4b57611a4b611e32565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908382118183101715611a9157611a91611e32565b816040528281528a6020848701011115611aa9578586fd5b82602086016020830137918201602001949094529598949750929550505050565b60008060408385031215611adc578182fd5b611ae583611927565b915060208301358015158114611af9578182fd5b809150509250929050565b60008060408385031215611b16578182fd5b611b1f83611927565b946020939093013593505050565b600060208284031215611b3e578081fd5b8135610c8081611e61565b600060208284031215611b5a578081fd5b8151610c8081611e61565b600060208284031215611b76578081fd5b5035919050565b60008151808452611b95816020860160208601611cd2565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b60008351611bd9818460208801611cd2565b835190830190611bed818360208801611cd2565b01949350505050565b600073ffffffffffffffffffffffffffffffffffffffff808716835280861660208401525083604083015260806060830152611c356080830184611b7d565b9695505050505050565b602081526000610c806020830184611b7d565b60008219821115611c6557611c65611dd4565b500190565b600082611c7957611c79611e03565b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611cb657611cb6611dd4565b500290565b600082821015611ccd57611ccd611dd4565b500390565b60005b83811015611ced578181015183820152602001611cd5565b83811115610b8b5750506000910152565b600081611d0d57611d0d611dd4565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b600181811c90821680611d4757607f821691505b60208210811415611d81577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415611db957611db9611dd4565b5060010190565b600082611dcf57611dcf611e03565b500690565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7fffffffff0000000000000000000000000000000000000000000000000000000081168114611e8f57600080fd5b5056fea264697066735822122048f4efb2a5a849ee89099fa8da925bf2be4d7ed0a14d77e66d9f077ec68cd43e64736f6c63430008040033";

export class RevertToken__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _baseURI: string,
    _minters: string[],
    _revertModulus: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<RevertToken> {
    return super.deploy(
      _baseURI,
      _minters,
      _revertModulus,
      overrides || {}
    ) as Promise<RevertToken>;
  }
  getDeployTransaction(
    _baseURI: string,
    _minters: string[],
    _revertModulus: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _baseURI,
      _minters,
      _revertModulus,
      overrides || {}
    );
  }
  attach(address: string): RevertToken {
    return super.attach(address) as RevertToken;
  }
  connect(signer: Signer): RevertToken__factory {
    return super.connect(signer) as RevertToken__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RevertTokenInterface {
    return new utils.Interface(_abi) as RevertTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RevertToken {
    return new Contract(address, _abi, signerOrProvider) as RevertToken;
  }
}
