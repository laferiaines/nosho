const Telegraf = require("telegraf");
const fs = require("fs");
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')


const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const PSWD = "ADMIN"
let alreadyBought = false;

const channel = "@testing_ground"

let interval;

const bot = new Telegraf("1481791998:AAFS9WU9TQSiEF7FHaiagZL10D-HqvlpSRk", {channelMode: true})

bot.start( (ctx) => {
	
	const nome = ctx.message.from.first_name
	
    ctx.reply("Rules of the club\n\nHowdy "+nome+" ! Thanks for getting me started ! You are now officially a part of NoSho. Welcome to the club 👏🏼👏🏼 Bra-vo!\n\nAt NoSho we want to provide you with last minute table availability in the most popular places in town. So you can spontaneously book seats if you suddenly decide to go out for a meal or even if you like to be surprised by what will be on offer. \n\nHere’s how this works. Whenever a restaurant has a last minute availability, I will message the channel and let all the members know. The message will state the name of the restaurant, table for how many, what time and if you’re lucky, some promo too. All you have to do is press the Book button that follows the message. Be fast and be decisive, as you will be competing against the other members of the NoSho club. \n\nIf you win, you will get notified by me, to send your contact to the restaurant in order to validade your reservation. You then have until the reservation hour to show up, which depending on how last minute it is, can mean just some mere minutes. Unless you reach a time agreement with the restaurant. \n\nNow "+nome+ ", a word of notice though, please don’t book if your intentions aren’t to attend that restaurant ! We don’t want you to be the party pooper of the club 😉 \n\nThat’s all from me at this point ! So, I wish you good luck with your bookings. May the food be with you ! 😎"	
	)
	
})


bot.command("nosho2", (ctx) => {
	
	const sellerId = ctx.chat.id
	
	const opts = {
		"reply_markup": {
            "inline_keyboard": [[
                {
                    "text": "Sim",
                    "callback_data": "nosho 0 " +sellerId + " Sim"            
                }, 
                {
                    "text": "Não",
                    "callback_data": "nosho 0 "+sellerId + " Não"            
                }
				]
            ]
        }
	}

	bot.telegram.sendMessage(sellerId, "Olá, deseja publicar um NoSho:", opts)

})


let currentSells = [];


bot.on('message', (ctx) => {
	console.log(ctx.message.reply_to_message)
	
	
	if (ctx.message.contact) {
	
	
		const firstName = ctx.message.contact.first_name
		const lastName = ctx.message.contact.last_name
		const phoneNumber = ctx.message.contact.phone_number
		const buyerId = ctx.message.chat.id
	
		let currentSell

		for (sell of currentSells) {
			if (sell.buyerId == buyerId) {
            currentSell = sell
			}
		}
		
    if (currentSell) {
        if (phoneNumber) {
			if(lastName) {
            ctx.telegram.sendMessage(currentSell.sellerId,"A mesa foi reservada por:\n\nNome: "+firstName+ " " +lastName+ "\n\Número: +" +phoneNumber+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
			}
			else {
		ctx.telegram.sendMessage(currentSell.sellerId,"A mesa foi reservada por:\n\nNome: "+firstName+"\n\Número: +" +phoneNumber+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
            }
			ctx.reply("Contact sent, thank you 😊")
			
            currentSells.splice(currentSells.indexOf(sell),1)
        }
    }
	}
	
	
	if (ctx.message.reply_to_message) {
	const from = ctx.update.message.chat.id
	
	const replyTo = ctx.message.reply_to_message.text
	if (replyTo == "Por favor insira o nome do seu restaurante:" ) {   
		
	const restaurante = ctx.message.text

		
		const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "2",
							"callback_data": "nosho 1 "+from + " "+restaurante+" 2"            
						}, 
						{
							"text": "4",
							"callback_data": "nosho 1 "+from + " "+restaurante+" 4"            
						},
						{
							"text": "6",
							"callback_data": "nosho 1 "+from + " "+restaurante+" 6"             
						},
						{
							"text": "8",
							"callback_data": "nosho 1 "+from + " "+restaurante+" 8"            
						}
						]
					]
				}
			}
			bot.telegram.sendMessage(from, "Para quantas pessoas?" , opts)
	}
	}
})

bot.on('contact', (ctx) => {

	const firstName = ctx.update.message.contact.first_name
	const lastName = ctx.update.message.contact.last_name
	const phoneNumber = ctx.update.message.contact.phone_number
    
	const buyerId = ctx.update.message.chat.id
	
	let currentSell

    for (sell of currentSells) {
        if (sell.buyerId == buyerId) {
            currentSell = sell
        }
    }
    if (currentSell) {
        if (phoneNumber) {
			if(lastName) {
            ctx.telegram.sendMessage(currentSell.sellerId,"A mesa foi reservada por:\n\nNome: "+firstName+ " " +lastName+ "\n\Número: +" +phoneNumber+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
			}
			else {
		ctx.telegram.sendMessage(currentSell.sellerId,"A mesa foi reservada por:\n\nNome: "+firstName+"\n\Número: +" +phoneNumber+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
            }
			ctx.reply("Contact sent, thank you 😊")
			
            currentSells.splice(currentSells.indexOf(sell),1)
        }
    }

})


//GETUPDATES
bot.action(/[0-9]/, (ctx) => {
    
    console.log(ctx.update.callback_query.data)
	console.log(ctx.update)
	
	const querydata =ctx.update.callback_query.data.split(" ")
	let command
	command = querydata.splice(0,1)
	console.log(command)
	
	if (command == "nosho") {
			
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}
			
			console.log('entrou na query nosho')
			const msg = ctx.update.callback_query.data.split(" ")
			console.log(ctx.update.callback_query.data)
			
			const sellerId = msg[2]	
			
		if (msg[1] == "0") {
			
			if (msg[msg.length-1] = "Sim") {
			
			
			bot.telegram.sendMessage(sellerId, "Por favor insira o nome do seu restaurante:" , {reply_markup : {"force_reply": true}})
			
		}
		}
	else if (msg[1] == "1") {
			
			console.log(msg)
			
			let calldata
			calldata = msg.splice(1,msg.length-1)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-1)
			restaurant = restaurant.join(" ")
			
			const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "Almoço",
							"callback_data": "nosho 2 " +sellerId+ " " +restaurant+ " A"            
						}, 
						{
							"text": "Jantar",
							"callback_data": "nosho 2 " +sellerId+ " " +restaurant+ " J"        
						}
						]
					]
				}
			}	
	
			bot.telegram.sendMessage(sellerId, "Para:" , opts)
		}
	else if (msg[1] == "2") {
			
			console.log(msg)
			
			let calldata
			calldata = msg.splice(1,msg.length-3)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-1)
			restaurant = restaurant.join(" ")
			console.log(restaurant)
			
			if ( msg[msg.length-1] == "J" ) {
				
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "19:30",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 19:30"            
							}, 
							{
								"text": "19:45",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 19:45"            
							},
							{
								"text": "20:00",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 20:00"            
							}, 		
							{
								"text": "20:15",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 20:15"            
							},
							{
								"text": "20:30",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 20:30"            
							},
							{
								"text": "20:45",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 20:45"            
							}],
							[
							{
								"text": "21:00",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 21:00"            
							},
							{
								"text": "21:15",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 21:15"            
							},{
								"text": "21:30",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 21:30"            
							},{
								"text": "21:45",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 21:45"            
							},{
								"text": "22:00",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 22:00"            
							},{
								"text": "22:15",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 22:15"            
							}							
							]
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Horas:" , opts)
		}
		else {
				
			const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "12:30",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 12:30"            
							},
							{
								"text": "12:45",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 12:45"            
							}, 							
							{
								"text": "13:00",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 13:00"            
							},
							{
								"text": "13:15",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 13:15"            
							}, 
							{
								"text": "13:30",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 13:30"            
							}], 		
							[{
								"text": "13:45",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 13:45"            
							}, 
							{
								"text": "14:00",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 14:00"            
							},
							{
								"text": "14:15",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 14:15"            
							},
							{
								"text": "14:30",
								"callback_data": "nosho 3 " +sellerId+ " " +restaurant+ " " +msg[msg.length-2]+ " 14:30"            
							}]
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Horas:" , opts)
		}	
	}
	else if (msg[1] == "3") {
			
			console.log(msg)
			
			let calldata
			calldata = msg.splice(1,msg.length-1)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-2)
			restaurant = restaurant.join(" ")
			console.log(restaurant)
			
			
			
			const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "Sim",
							"callback_data": "nosho 4 " +sellerId+ " " +restaurant+ " S"            
						}, 
						{
							"text": "Não",
							"callback_data": "nosho 4 " +sellerId+ " " +restaurant+ " N"        
						}
						]
					]
				}
			}	
	
			bot.telegram.sendMessage(sellerId, "Deseja aplicar uma promoção?" , opts)
		}

	else if (msg[1] == "4") {
			
			console.log(msg)
			
			let calldata
			calldata = msg.splice(1,msg.length-2)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-1)
			restaurant = restaurant.join(" ")
			console.log(restaurant)
			
			if ( msg[msg.length-1] == "S" ) {
				
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "5%",
								"callback_data": "nosho 5 " +sellerId+ " " +restaurant+ " 5%"            
							}, 
							{
								"text": "10%",
								"callback_data": "nosho 5 " +sellerId+ " " +restaurant+ " 10%"            
							},
							{
								"text": "15%",
								"callback_data": "nosho 5 " +sellerId+ " " +restaurant+ " 15%" 
							}], 		
							[{
								"text": "20%",
								"callback_data": "nosho 5 " +sellerId+ " " +restaurant+ " 20%"
							},
							{
								"text": "25%",
								"callback_data": "nosho 5 " +sellerId+ " " +restaurant+ " 25%"
							},
							{
								"text": "50%",
								"callback_data": "nosho 5 " +sellerId+ " " +restaurant+ " 50%"
							}]
							
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Escolha um dos valores:" , opts)
		}
		else {
			
			console.log("enviar mensagem sem promo")
			console.log(restaurant)
			console.log(sellerId)
			
			
			currentSells.push({
				alreadyBought: false,
				sellerId: sellerId
			})
			
			let info = 	restaurant.split(" ")
			const time = info[info.length-1]
			const people = info[info.length-2]
			
			let restaurant_name
			restaurant_name = info.splice(0, info.length-2)
			console.log(restaurant_name)
			restaurant_name = restaurant_name.join(" ")
			console.log(restaurant_name)
			
	
			bot.telegram.sendMessage( channel,"Restaurant : "+restaurant_name+"\nTable for : "+people+ "\nTime : " + time,{reply_markup: {
            inline_keyboard: [
                [{text:"Book now ",callback_query:"blz",callback_data:ctx.chat.id+" "+restaurant_name+" "+people+" "+ time}]
            ]
            }
        })
		.then(function (result) {
	
			interval = setTimeout( () => {
						bot.telegram.deleteMessage(channel, result.message_id)
					},900000)
		});
	}


				
	}
	else if (msg[1] == "5") {
	
			console.log("enviar mensagem promo")
			
			
			let calldata
			calldata = msg.splice(1,msg.length-1)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-2)
			restaurant = restaurant.join(" ")
			console.log(restaurant)
			
			currentSells.push({
				alreadyBought: false,
				sellerId: sellerId
			})
			
			let info = 	restaurant.split(" ")
			const promo = info[info.length-1]
			const time = info[info.length-2]
			console.log(time)
			const people = info[info.length-3]
			console.log(info)
			
			let restaurant_name
			restaurant_name = info.splice(0, info.length-3)
			console.log(restaurant_name)
			restaurant_name = restaurant_name.join(" ")
			console.log(restaurant_name)
			
	
			bot.telegram.sendMessage( channel,"Restaurant : "+restaurant_name+"\nTable for : "+people+ "\nTime : " + time+ "\nPromo: "+promo,{reply_markup: {
            inline_keyboard: [
                [{text:"Book now ",callback_query:"blz",callback_data:ctx.chat.id+" "+restaurant_name+" "+people+" "+ time}]
            ]
            }
        })
		.then(function (result) {
	
			interval = setTimeout( () => {
						bot.telegram.deleteMessage(channel, result.message_id)
					},900000)
		});
	
	
	}
	}
	
	else
	{
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}

		const msg = ctx.update.callback_query.data.split(" ")
		const sellerId = msg[0]
		
		let restaurant
		restaurant = msg.splice(1, msg.length-3)
		restaurant = restaurant.join(" ")

		console.log("SellerId CONGRATS: "+sellerId)

		const nrPessoas = msg[msg.length-2]
		const hora = msg[msg.length-1]		
	
		const userId = ctx.update.callback_query.from.id
		const username = ctx.update.callback_query.from.username
		const firstName = ctx.update.callback_query.from.first_name
		
		let currentSell
		
		for (sell of currentSells) {
			if (sell.sellerId = sellerId) {
				currentSell = sell
			}
		}

		if (!currentSell.alreadyBought) {
			
			currentSell.alreadyBought = true;
			
			bot.telegram.sendMessage(channel,"Congratulations "+firstName+ " 👏🏼👏🏼 \""+restaurant+"\" was booked for "+nrPessoas+" people at "+hora+ ". Our bot has DM'ed you with further instructions.") 
			
			let nrMembers
			let message
			message = bot.telegram.getChatMembersCount(channel).then(nrMembers => {	
															
																bot.telegram.sendMessage(userId,"Congratulations "+firstName+ " 👏🏼 you were the fastest among "+nrMembers+" subscribers of NoSho club to book \""+restaurant+"\" !\n\nTo confirm this table of "+nrPessoas+" at "+hora+ ", we need you to provide your contact details to \""+restaurant+"\". Your contact will not be stored anywhere and will only be seen by the restaurant host.\n\nJust press the button below 👇🏼", 
			Extra.markup((markup) => {
				return markup.keyboard([
						markup.contactRequestButton('Send contact')
						])
					.oneTime()
		  
			}))
			})
			currentSell.buyerId = userId								
				  
			}

	}	
})

bot.command("schedule", (ctx) => {
	
    if (ctx.message) {
		
        let req = ctx.message.text.split(" ")
        const password = req[1]
        const delay = parseFloat(req[2])*1000*60*60;
        req.splice(0,3)
        message = req.join(" ")	
		
        if (password && password==PSWD && delay && req && message) {
            ctx.reply("Ok ! ")
            interval = setInterval( () => {
                bot.telegram.sendMessage(channel,message)
            },delay)
        } else {
            ctx.reply("Invalid syntax ! ")
        }
        
    }

})

bot.command("text", (ctx) => {
	
	if (ctx.message) {
		
        let req = ctx.message.text.split(" ")
 
        const password = req[1]
		req.splice(0,2)
        message = req.join(" ")

		if (password && password==PSWD && req && message) {
            ctx.reply("Message sent! ")
            bot.telegram.sendMessage(channel,message)
        } else {
            ctx.reply("Invalid syntax! ")
        }
    }
})

bot.launch();