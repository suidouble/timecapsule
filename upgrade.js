const { SuiMaster } = require('suidouble');
const config = require('./config.js');
const path = require('path');

const run = async()=>{
    const phrase = config.phrase;
    const chain = config.chain;
    const packageId = config.packageId;
    const adminCapId = config.adminCapId;
    const storeId = config.storeId;

    if (!packageId || !adminCapId || !storeId) {
        throw new Error("packageId, adminCapId and storeId required")
    }

    const suiMaster = new SuiMaster({provider: chain, phrase: phrase, debug: true});

    try {
        await suiMaster.requestSuiFromFaucet();
    } catch (e) {
        console.error(e);
    }
    await suiMaster.getBalance();

    const movePackage = suiMaster.addPackage({
        id: packageId,
        path: path.join(__dirname, 'move'),
    });

    await movePackage.upgrade();

    console.log('should be upgraded');
    console.log('upgraded packageId', movePackage.address);

    await new Promise((res)=>setTimeout(res, 10000));

    try {
        const success = await movePackage.moveCall('timecapsule', 'migrate', [storeId, adminCapId]);
        if (success && success.status == 'success') {
            console.log('migrate function successfull');
        }
    } catch (e) {
        console.error(e);
    }
};

run();