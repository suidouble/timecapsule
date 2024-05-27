const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

const path = require('path');
const fs = require('fs');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/simulations/get';
        this._method = 'post';
	}

    async handle(req, reply) {
        const name = req.body.name;

        let clearName = (''+name).split('/').join('').split("\\").join('').split('..').join('');
        console.log(name);

        const filePath = path.join(__dirname, '../../simulations', clearName);

        let content = await new Promise((res)=>{
            fs.readFile(filePath, (err, buff) => {
                if (err) {
                    res('');
                } else {
                    res( buff.toString() );
                }
            });            
        });

        if (content.indexOf('price_of_last_transaction') == -1) {
            // just another quick check we loaded simulation
            content = '';
        }

        reply.send({
            success: true,
            json: content,
        });
    }
}

module.exports = Handler;