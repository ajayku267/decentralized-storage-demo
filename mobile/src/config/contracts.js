export const STORAGE_CONTRACT_ADDRESS = process.env.REACT_APP_STORAGE_CONTRACT_ADDRESS;

export const STORAGE_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "internalType": "string",
        "name": "fileType",
        "type": "string"
      }
    ],
    "name": "uploadFile",
    "outputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      }
    ],
    "name": "getFileByCid",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "size",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "uploadDate",
            "type": "uint256"
          }
        ],
        "internalType": "struct FileStorage.File",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserFiles",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "size",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "uploadDate",
            "type": "uint256"
          }
        ],
        "internalType": "struct FileStorage.File[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserProfile",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalStorageUsed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "filesStored",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "memberSince",
            "type": "uint256"
          }
        ],
        "internalType": "struct FileStorage.UserProfile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "totalStorageUsed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "filesStored",
        "type": "uint256"
      }
    ],
    "name": "updateUserProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "notifications",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "autoBackup",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "storageLimit",
        "type": "uint256"
      }
    ],
    "name": "updateUserSettings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStorageProviders",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "address",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "totalSpace",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "usedSpace",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reputationScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakedAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct FileStorage.StorageProvider[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      }
    ],
    "name": "deleteFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      }
    ],
    "name": "generateShareLink",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 