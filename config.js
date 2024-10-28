const argv = require('minimist')(process.argv.slice(2));

let selectedChain = argv.chain || 'local';

const settings = {
    "local": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
        "packageId": "0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448",
        "firstVPackageId": "0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448",
    },
    "mainnet": {
        "phrase": "", // set it as cli parameter
        "packageId": "0x9f246ed250ccdac3e04c1b677d22ae33c69bec173f7a647cd26a6275b492d5e0",
        "firstVPackageId": "0x020abcd433df2c68f62b794d0751d3a839945dcb6776ecf9fac76d3f0324a274",
        "adminCapId": "0xbcad83ff70a4d135ff2170490d5bd3718af9687af7da4902babac20d9f64288c",
        "storeId": "0xbd1124c2183396d47b3c7c2f286880eb4992cca624f7cd2a1dfae8bc8a6fe421",
    }, 
    "testnet": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
        "packageId": "0x308e141e6f760adfe6773be39d0cdd79ca274b639e0b438cec1156a392306199",
        "firstVPackageId": "0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448",
        "storeId": "0x6657d601d835715114894717ba3b87bc7a9bd3a1fbbd5e042f53d5438b8ee390",
        "adminCapId": "0x46a2e3627a1226179a33ee579b97f69295d5217ad4b5ac01d90dc250ab7e2961",
    },
};


if (settings['mainnet'].phrase) {
    throw new Error('please do not. Use --phrase cli parameter');
}

settings[selectedChain].chain = selectedChain;
if (argv.phrase) {
    settings[selectedChain].phrase = argv.phrase;
}

module.exports = settings[selectedChain];
