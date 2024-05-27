const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

const path = require('path');
const fs = require('fs');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/simulations/list';
        this._method = 'get';
	}

    async handle(req, reply) {
        const directoryPath = path.join(__dirname, '../../simulations');

        const items = await new Promise((res)=>{

            fs.readdir(directoryPath, (err, files)=>{
                const items = [];
                //handling error
                if (err) {
                    console.log('Unable to scan directory: ' + err);
                } else {
                    //listing all files using forEach
                    files.forEach(function(file){
                        if (file.indexOf('.json') !== -1) {
                            items.push(file);
                        }
                    });
                }
    
                res(items);
            });
    

        });
        reply.send({
            success: true,
            items: items,
        });
    }
}

module.exports = Handler;