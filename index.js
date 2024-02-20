const snarkjs = require('snarkjs');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider('https://stylus-testnet.arbitrum.io/rpc');
const contractAddress = '0xc574c3ca325A949BD3cf2c11BA5Bdd8fCCcb3Ad4';
const contractABI = [
  {
      "inputs": [
          {
              "internalType": "uint256[9]",
              "name": "words",
              "type": "uint256[9]"
          }
      ],
      "name": "verifyProof",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "pure",
      "type": "function"
  }
];

const contract = new ethers.Contract(contractAddress, contractABI, provider);

const corsOptions = {
    origin:
        "*",
    credentials: true,
    optionSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const generateProof = async (input_img, operation) => {
    const img_data = JSON.parse(input_img);

    const image_array = img_data.input;

    const rows = 128;
    const cols = 128;
    const image = new Array(rows);

    for (let i = 0; i < rows; i++) {
        image[i] = new Array(cols).fill(0);
    }

    let img_index = 0;
    for (let i = 0; i < 128; i++) {
        for (let j = 0; j < 128; j++) {
            image[i][j] = image_array[img_index];
            img_index++;
        }
    }

    // console.log(image);

    let input = {
        "option": operation,
        "orig": image,
    }

    // console.log(input);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, 'circuit.wasm', 'circuit_final.zkey');

    return proof;
}

app.get('/generate-proof', async (req, res) => {
    const body = req.body;
    const operation = JSON.parse(req.body.input).operation;
    const response = await generateProof(body.input, operation);

    // disabled proof verification now
    
    // const proofCalldata = await snarkjs.groth16.exportSolidityCallData(response, [operation]);
    // console.log(proofCalldata);


    // const regex = /0x[\da-fA-F]+/g;
    
    // const parsedProof = proofCalldata.match(regex);
    
    // const parsedProof = JSON.parse(JSON.stringify(sample));
    // console.log("proof", parsedProof);

    // const isVerified = await contract.verifyProof(parsedProof);
    // console.log(isVerified)

    res.send(JSON.stringify({ message: response }));
})

app.listen('4000', () => {
    console.log('Server is running on port 4000');
});
