const fetch = require('node-fetch')

module.exports = 
    class Rollet {
        constructor(adress, cb){
            this.adress = adress
            this.cb = cb
        }
        test(todo) {
            fetch(`${this.adress}/switch.json`)
                .then(res => res.json())
                .then(json => {
                if (json.switch.oldMove !== todo) this.to_do(todo)
                else if (json.switch.move !== 'stop') setTimeout(() => this.test(todo), 3000)
                    else this.cb({
                        'adress': this.adress,
                        'device': 'rollet',
                        'prop': 'todo',
                        'return': (todo === 'up')?'open':'close'
                    })
                })
        }
        to_do(todo){
            fetch(`${this.adress}/switch?rollet=${todo}`)
                .then(res => res.json())
                .then(json => setTimeout(() => this.test(todo), 3000))
        }
        status(sb) {
            fetch(`${this.adress}/switch.json`)
                .then(res => res.json())
                .then(json => {
                    let oldmove = json.switch.oldMove
                    if (oldmove == 'stop') oldmove = 'помилка'
                    if (oldmove == 'up') oldmove = 'відкрито'
                    if (oldmove == 'down') oldmove = 'закрито'
                    sb(oldmove)
                })
        }
        now(sb) {
            fetch(`${this.adress}/switch.json`)
                .then(res => res.json())
                .then(json => sb(json.switch.move))
        }
    }
