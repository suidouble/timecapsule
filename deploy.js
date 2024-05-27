const { SuiMaster } = require('suidouble');
const config = require('./config.js');
const path = require('path');

const run = async()=>{
    const phrase = config.phrase;
    const chain = config.chain;

    const suiMaster = new SuiMaster({provider: chain, phrase: phrase, debug: true});

    await suiMaster.requestSuiFromFaucet();
    await suiMaster.getBalance();

    const package = suiMaster.addPackage({
        path: path.join(__dirname, 'move'),
    });

    await package.publish();

    console.log('deployed as', package.id);
};

run();