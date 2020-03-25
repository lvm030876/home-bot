const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Rollet = require('./roll_class')
const Weather = require('./weather_class')
const Switcher = require('./switcher_class')

const bot = new Telegraf('551117157:AAH4ApBGmrsY_Vf2WaiyNs7xY4o2xqtwaK4')
const botName = 'Петя'
const id_chat = '-1001485632033'
const adress = 'http://192.168.1.'

const morning = undefined
const weatherS = new Weather(`${adress}91`, t => test_light(t))
const rollets = []
const switchers = []

for (let i = 0; i < 8; i++) 
    rollets[i] = new Rollet(`${adress}${20 + i}`, t => teleg(t))
for (let i = 0; i < 6; i++) 
    switchers[i] = new Switcher(`${adress}${40 + i}`, t => teleg(t))

function teleg(t) {
    console.log(t.adress)
    bot.telegram.sendMessage(id_chat, `${t.adress} property '${t.prop}' is ${t.return}`)
}

function test_light(t) {
    let light = +t.sensor.light
    function fun(params) {
        console.log(params?'close':'open')
        for (let i = 1; i < 4; i++) rollets[i].test(params?'down':'up')
        [0, 1, 3].forEach(i => switchers[i].pir_prot(params?'0':'1'))
        morning = params
    }
    if (morning == undefined) {
        light = (light >= 50)?light:30
        morning = (light >= 50)
    }
    if ((light <= 30)&&!morning) fun(true)
    if ((light >= 50)&&morning)  fun(false)
}

function start_fn() {
    weatherS.test()
    let timeH = new Date().getHours()
    let timeP = 29 - timeH
    if (timeH < 16) timeP = 16 - timeH
    if (timeH < 5) timeP = 5 - timeH
    timeP = timeP * 60
    if ((5 <= timeH) && (timeH < 8)) timeP = 5
    if ((16 <= timeH) && (timeH < 20)) timeP = 5
    console.log(`sleeping on ${timeP} min`)
    setTimeout(start_fn, timeP * 60000)
}

function keygen(params) {
    let myarray = []
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const element = params[key];
            myarray.push([Markup.callbackButton(key, element)])
        }
    }
    return Extra.markdown().markup(Markup.inlineKeyboard(myarray))
}

bot.on('message', (ctx) => {
    if ((ctx.update.message.chat.id == id_chat)&&(ctx.update.message.text)) 
        if (ctx.update.message.text.startsWith(botName))
            ctx.reply('перелік команд', 
                keygen({
                    'Освітлення':'light',
                    'Ролети':'rollet',
                    'Мікроклімит':'weather'
                }))
})

function mymenu(ctx, text, key) {
    if (ctx.update.callback_query.message.chat.id == id_chat) ctx.editMessageText(text, key)
}

bot.action('menu', ctx => {
    mymenu(ctx, 'перелік команд',
        keygen({
            'Освітлення':'light',
            'Ролети':'rollet',
            'Мікроклімит':'weather'
        })
)})

bot.action('light', ctx => {
    mymenu(ctx, 'Освітлення', 
        keygen({
            'вуліця':'light5',
            'Назад':'menu'
        })
)})

bot.action(`light5`, ctx => {
    mymenu(ctx, `Вуліця`, 
        keygen({
            'Увімкнути':`light5on`,
            'Вимкнути':`light5off`,
            'Статус':`light5s`,
            'Назад':'light'
        })
)})
    
bot.action(`light5on`, ctx => switchers[5].light_do({'group': 'B', 'do': 1}))
    
bot.action(`light5off`, ctx => switchers[5].light_do({'group': 'B', 'do': 0}))
    
bot.action(`light5s`, ctx => switchers[5].status('B', date => ctx.answerCbQuery(date)))

bot.action('rollet', ctx => { 
    let myarray = []
    for (let i = 0; i < 8; i++) myarray.push([Markup.callbackButton(`ролети №${i}`, `rollet${i}`)])
    myarray.push([Markup.callbackButton('Назад', 'menu')])
    mymenu(ctx, 'ролети', Extra.markdown().markup(Markup.inlineKeyboard(myarray)))
})

for (let i = 0; i < rollets.length; i++) {
    bot.action(`rollet${i}`, ctx => {
        mymenu(ctx, `ролети №${i}`,
            keygen({
                'Відкрити': `rollet${i}o`,
                'Закрити': `rollet${i}c`,
                'Статус': `rollet${i}s`,
                'Назад': 'rollet'
            })
    )})

    bot.action(`rollet${i}o`, ctx => {
        if (ctx.update.callback_query.message.chat.id == id_chat)
            rollets[i].now(data => {
                if (data == "stop")  rollets[i].test('up')
                ctx.answerCbQuery((data == "stop")?"відкриваю":"зайнято")
            })
    })
    
    bot.action(`rollet${i}c`, ctx => {
        if (ctx.update.callback_query.message.chat.id == id_chat)
            rollets[i].now(data => {
                if (data == "stop") rollets[i].test('down')
                ctx.answerCbQuery((data == "stop")?"закриваю":"зайнято")
            })
    })
    
    bot.action(`rollet${i}s`, ctx => {
        if (ctx.update.callback_query.message.chat.id == id_chat)
            rollets[i].status(date => ctx.answerCbQuery(date))
    })
}

// start_fn()

bot.launch()

// bot.telegram.sendMessage(id_chat, 'bot started')