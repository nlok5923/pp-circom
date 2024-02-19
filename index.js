const snarkjs = require('snarkjs');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const corsOptions = {
    origin:
        "*",
    credentials: true,
    optionSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const generateProof = async (input_img) => {
    // console.log('This is context ', ctx);
    const img_data = JSON.parse(input_img);
    // let input;

    console.log('This is context ', img_data);
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

    console.log(image);

    let input = {
        "option": "1",
        "orig": image,
    }

    console.log(input);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, 'circuit.wasm', 'circuit_final.zkey');

    console.log('proof', proof);
    console.log("signals", publicSignals);

    return proof;
}

app.get('/generate-proof', async (req, res) => {
    const body = req.body;
    const response = await generateProof(body.input);
    res.send(JSON.stringify({ message: response }));
})

app.listen('4000', () => {
    console.log('Server is running on port 4000');
});
