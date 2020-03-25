const fetch = require('node-fetch');

module.exports = 
    class Switcher {
        constructor(adress, cb){
            this.adress = adress;
            this.cb = cb;
        }
        pir_prot(todo){
            fetch(`${this.adress}/switch?pirProt=${todo}`)
                .then(res => res.json())
                .then(json => this.cb({
                    'adress': this.adress,
                    'device': 'switcher',
                    'prop': 'pirProt',
                    'return': (todo === '0')?'disable':'enable'
                }))
        }
        light_do(todo){
            fetch(`${this.adress}/switch?switch${todo.group}=${todo.do}`)
                .then(res => res.json())
                .then(json => this.cb({
                    'adress': this.adress,
                    'device': 'switcher',
                    'prop': `switch${todo.group}`,
                    'return': (todo.do === '0')?'off':'on'
                }))
        }
        status(group, sb) {
            fetch(`${this.adress}/switch.json`)
                .then(res => res.json())
                .then(json => sb(json.switch[`switch${group}`]?"увімкнено":"вимкнено"))
        }
    }