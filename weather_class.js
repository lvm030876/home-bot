const fetch = require('node-fetch');

module.exports = 
    class Weather {
        constructor(adress, callback){
            this.adress = adress;
            this.callback = callback;
        }
        test() {
            fetch(`${this.adress}/sensor.json`)
                .then(res => res.json())
                .then(json => this.callback(json))
        }
    }
