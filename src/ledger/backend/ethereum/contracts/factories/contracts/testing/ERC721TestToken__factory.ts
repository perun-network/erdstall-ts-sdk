/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  ERC721TestToken,
  ERC721TestTokenInterface,
} from "../../../contracts/testing/ERC721TestToken";

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
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
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
    inputs: [],
    name: "reset",
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
        name: "data",
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
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405180604001604052806008815260200167546573742037323160c01b815250604051806040016040528060038152602001621514d560ea1b81525081600090816200006091906200011d565b5060016200006f82826200011d565b505050620001e9565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620000a357607f821691505b602082108103620000c457634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200011857600081815260208120601f850160051c81016020861015620000f35750805b601f850160051c820191505b818110156200011457828155600101620000ff565b5050505b505050565b81516001600160401b0381111562000139576200013962000078565b62000151816200014a84546200008e565b84620000ca565b602080601f831160018114620001895760008415620001705750858301515b600019600386901b1c1916600185901b17855562000114565b600085815260208120601f198616915b82811015620001ba5788860151825594840194600190910190840162000199565b5085821015620001d95787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b611c7d80620001f96000396000f3fe608060405234801561001057600080fd5b506004361061011b5760003560e01c80636352211e116100b2578063b88d4fde11610081578063d826f88f11610066578063d826f88f1461026b578063de836ebd1461027a578063e985e9c51461028d57600080fd5b8063b88d4fde14610245578063c87b56dd1461025857600080fd5b80636352211e146101f657806370a082311461020957806395d89b411461022a578063a22cb4651461023257600080fd5b806321175b4a116100ee57806321175b4a146101aa57806323b872dd146101bd57806342842e0e146101d057806354ed9e32146101e357600080fd5b806301ffc9a71461012057806306fdde0314610148578063081812fc1461015d578063095ea7b314610195575b600080fd5b61013361012e36600461169a565b6102d6565b60405190151581526020015b60405180910390f35b6101506103bb565b60405161013f9190611725565b61017061016b366004611738565b61044d565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200161013f565b6101a86101a336600461177a565b610481565b005b6101a86101b83660046117b3565b610609565b6101a86101cb3660046117ce565b610677565b6101a86101de3660046117ce565b6106b2565b6101a86101f136600461180a565b6106e7565b610170610204366004611738565b610778565b61021c61021736600461184e565b6107ea565b60405190815260200161013f565b61015061089e565b6101a8610240366004611869565b6108ad565b6101a86102533660046118d4565b6108bc565b610150610266366004611738565b610944565b6101a860006007819055600955565b6101a86102883660046119ce565b6109b8565b61013361029b366004611a54565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260056020908152604080832093909416825291909152205460ff1690565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f80ac58cd00000000000000000000000000000000000000000000000000000000148061036957507fffffffff0000000000000000000000000000000000000000000000000000000082167f5b5e139f00000000000000000000000000000000000000000000000000000000145b806103b557507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b6060600080546103ca90611a87565b80601f01602080910402602001604051908101604052809291908181526020018280546103f690611a87565b80156104435780601f1061041857610100808354040283529160200191610443565b820191906000526020600020905b81548152906001019060200180831161042657829003601f168201915b5050505050905090565b6000610458826109f7565b5060009081526004602052604090205473ffffffffffffffffffffffffffffffffffffffff1690565b600061048c82610778565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036105345760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f720000000000000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff82161480610588575073ffffffffffffffffffffffffffffffffffffffff8116600090815260056020908152604080832033845290915290205460ff165b6105fa5760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c000000606482015260840161052b565b6106048383610a6b565b505050565b60006007557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600955600880548291907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561066f5761066f611ada565b021790555050565b6000610681610b0b565b9050600281600581111561069757610697611ada565b036106a157600080fd5b6106ac848484610b71565b50505050565b60006106bc610b0b565b905060028160058111156106d2576106d2611ada565b036106dc57600080fd5b6106ac848484610bf8565b600680548591907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561072457610724611ada565b02179055506007839055600880548391907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600183600581111561076b5761076b611ada565b0217905550600955505050565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff16806103b55760405162461bcd60e51b815260206004820152601860248201527f4552433732313a20696e76616c696420746f6b656e2049440000000000000000604482015260640161052b565b600073ffffffffffffffffffffffffffffffffffffffff82166108755760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f74206120766160448201527f6c6964206f776e65720000000000000000000000000000000000000000000000606482015260840161052b565b5073ffffffffffffffffffffffffffffffffffffffff1660009081526003602052604090205490565b6060600180546103ca90611a87565b6108b8338383610c13565b5050565b6108c63383610d26565b6109385760405162461bcd60e51b815260206004820152602d60248201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560448201527f72206f7220617070726f76656400000000000000000000000000000000000000606482015260840161052b565b6106ac84848484610de6565b606061094f826109f7565b600061096660408051602081019091526000815290565b9050600081511161098657604051806020016040528060008152506109b1565b8061099084610e6f565b6040516020016109a1929190611b09565b6040516020818303038152906040525b9392505050565b60005b818110156106ac576109e5848484848181106109d9576109d9611b38565b90506020020135610f2d565b806109ef81611b96565b9150506109bb565b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16610a685760405162461bcd60e51b815260206004820152601860248201527f4552433732313a20696e76616c696420746f6b656e2049440000000000000000604482015260640161052b565b50565b600081815260046020526040902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091558190610ac582610778565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000600754600003610b4e57600954600003610b2b575060065460ff1690565b600160096000828254610b3e9190611bce565b909155505060085460ff16919050565b600160076000828254610b619190611bce565b909155505060065460ff16919050565b610b7b3382610d26565b610bed5760405162461bcd60e51b815260206004820152602d60248201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560448201527f72206f7220617070726f76656400000000000000000000000000000000000000606482015260840161052b565b610604838383611104565b610604838383604051806020016040528060008152506108bc565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610c8e5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c657200000000000000604482015260640161052b565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526005602090815260408083209487168084529482529182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b600080610d3283610778565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480610da0575073ffffffffffffffffffffffffffffffffffffffff80821660009081526005602090815260408083209388168352929052205460ff165b80610dde57508373ffffffffffffffffffffffffffffffffffffffff16610dc68461044d565b73ffffffffffffffffffffffffffffffffffffffff16145b949350505050565b610df1848484611104565b610dfd848484846113b1565b6106ac5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e7465720000000000000000000000000000606482015260840161052b565b60606000610e7c8361158a565b600101905060008167ffffffffffffffff811115610e9c57610e9c6118a5565b6040519080825280601f01601f191660200182016040528015610ec6576020820181803683370190505b5090508181016020015b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff017f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a8504945084610ed057509392505050565b73ffffffffffffffffffffffffffffffffffffffff8216610f905760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015260640161052b565b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16156110025760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000604482015260640161052b565b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16156110745760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000604482015260640161052b565b73ffffffffffffffffffffffffffffffffffffffff8216600081815260036020908152604080832080546001019055848352600290915280822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b8273ffffffffffffffffffffffffffffffffffffffff1661112482610778565b73ffffffffffffffffffffffffffffffffffffffff16146111ad5760405162461bcd60e51b815260206004820152602560248201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060448201527f6f776e6572000000000000000000000000000000000000000000000000000000606482015260840161052b565b73ffffffffffffffffffffffffffffffffffffffff82166112355760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f7265737300000000000000000000000000000000000000000000000000000000606482015260840161052b565b8273ffffffffffffffffffffffffffffffffffffffff1661125582610778565b73ffffffffffffffffffffffffffffffffffffffff16146112de5760405162461bcd60e51b815260206004820152602560248201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060448201527f6f776e6572000000000000000000000000000000000000000000000000000000606482015260840161052b565b600081815260046020908152604080832080547fffffffffffffffffffffffff000000000000000000000000000000000000000090811690915573ffffffffffffffffffffffffffffffffffffffff8781168086526003855283862080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01905590871680865283862080546001019055868652600290945282852080549092168417909155905184937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b600073ffffffffffffffffffffffffffffffffffffffff84163b1561157f576040517f150b7a0200000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff85169063150b7a0290611428903390899088908890600401611be1565b6020604051808303816000875af1925050508015611481575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820190925261147e91810190611c2a565b60015b611534573d8080156114af576040519150601f19603f3d011682016040523d82523d6000602084013e6114b4565b606091505b50805160000361152c5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e7465720000000000000000000000000000606482015260840161052b565b805181602001fd5b7fffffffff00000000000000000000000000000000000000000000000000000000167f150b7a0200000000000000000000000000000000000000000000000000000000149050610dde565b506001949350505050565b6000807a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000083106115d3577a184f03e93ff9f4daa797ed6e38ed64bf6a1f010000000000000000830492506040015b6d04ee2d6d415b85acef810000000083106115ff576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061161d57662386f26fc10000830492506010015b6305f5e1008310611635576305f5e100830492506008015b612710831061164957612710830492506004015b6064831061165b576064830492506002015b600a83106103b55760010192915050565b7fffffffff0000000000000000000000000000000000000000000000000000000081168114610a6857600080fd5b6000602082840312156116ac57600080fd5b81356109b18161166c565b60005b838110156116d25781810151838201526020016116ba565b50506000910152565b600081518084526116f38160208601602086016116b7565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b6020815260006109b160208301846116db565b60006020828403121561174a57600080fd5b5035919050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461177557600080fd5b919050565b6000806040838503121561178d57600080fd5b61179683611751565b946020939093013593505050565b80356006811061177557600080fd5b6000602082840312156117c557600080fd5b6109b1826117a4565b6000806000606084860312156117e357600080fd5b6117ec84611751565b92506117fa60208501611751565b9150604084013590509250925092565b6000806000806080858703121561182057600080fd5b611829856117a4565b93506020850135925061183e604086016117a4565b9396929550929360600135925050565b60006020828403121561186057600080fd5b6109b182611751565b6000806040838503121561187c57600080fd5b61188583611751565b91506020830135801515811461189a57600080fd5b809150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080600080608085870312156118ea57600080fd5b6118f385611751565b935061190160208601611751565b925060408501359150606085013567ffffffffffffffff8082111561192557600080fd5b818701915087601f83011261193957600080fd5b81358181111561194b5761194b6118a5565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908382118183101715611991576119916118a5565b816040528281528a60208487010111156119aa57600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b6000806000604084860312156119e357600080fd5b6119ec84611751565b9250602084013567ffffffffffffffff80821115611a0957600080fd5b818601915086601f830112611a1d57600080fd5b813581811115611a2c57600080fd5b8760208260051b8501011115611a4157600080fd5b6020830194508093505050509250925092565b60008060408385031215611a6757600080fd5b611a7083611751565b9150611a7e60208401611751565b90509250929050565b600181811c90821680611a9b57607f821691505b602082108103611ad4577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60008351611b1b8184602088016116b7565b835190830190611b2f8183602088016116b7565b01949350505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611bc757611bc7611b67565b5060010190565b818103818111156103b5576103b5611b67565b600073ffffffffffffffffffffffffffffffffffffffff808716835280861660208401525083604083015260806060830152611c2060808301846116db565b9695505050505050565b600060208284031215611c3c57600080fd5b81516109b18161166c56fea264697066735822122021bf00cdb02ea10202e5d3b00b2e9ed5050f13ac496ade7280a815f9a6ff112d64736f6c63430008130033";

type ERC721TestTokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC721TestTokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC721TestToken__factory extends ContractFactory {
  constructor(...args: ERC721TestTokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC721TestToken> {
    return super.deploy(overrides || {}) as Promise<ERC721TestToken>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC721TestToken {
    return super.attach(address) as ERC721TestToken;
  }
  override connect(signer: Signer): ERC721TestToken__factory {
    return super.connect(signer) as ERC721TestToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC721TestTokenInterface {
    return new utils.Interface(_abi) as ERC721TestTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC721TestToken {
    return new Contract(address, _abi, signerOrProvider) as ERC721TestToken;
  }
}