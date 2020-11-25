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

let primeiroNome
let ultimoNome
let telefone
let nomeRestaurante
let morada

const generalOptions = {
    primeiro_nome: 1,
    ultimo_nome: 2,
    telemovel: 3,
	idioma: 4
}

const generalOptionsRests = {
    nomeRestaurante: 1,
    morada: 2
}

const opsplit = ":°!°°°!°:";
const chatsplit = ":~!~~~!~:";


let interval;

const bot = new Telegraf("1394341645:AAHZSiEm2kw9Zxm3kOa3ghtEY2CGZ5n3C5M")

bot.start( (ctx) => {
	
	const userId = ctx.chat.id
	
	const opts = {
		"reply_markup": {
            "inline_keyboard": [[
                {
                    "text": "User",
                    "callback_data": "register 0 " +userId + " User"            
                }, 
                {
                    "text": "Restaurant",
                    "callback_data": "register 0 " +userId + " Restaurant"            
                }
				]
            ]
        }
	}

	bot.telegram.sendMessage(userId, "Welcome to the NoSho Club. Please register to become a member. Are you a:", opts)
})


bot.command("nosho", (ctx) => {
	
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

	bot.telegram.sendMessage(sellerId, "Olá, deseja publicar um NoSho?", opts)

})


let currentSells = [];


bot.on('message', (ctx) => {
	console.log(ctx.message.reply_to_message)	
	
	if (ctx.message.reply_to_message) {
		
		const from = ctx.update.message.chat.id
		console.log(ctx.message)
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
	else if (replyTo == "Please type your first name:") {	
	
		primeiroNome = ctx.message.text
		
		bot.telegram.sendMessage(from, "Please type your last name:" , {reply_markup : {"force_reply": true, "callback_data": "ola"}})
	}	
	else if (replyTo == "Por favor insira o seu primeiro nome:") {	
	
		primeiroNome = ctx.message.text
		
		bot.telegram.sendMessage(from, "Por favor insira o seu último nome:" , {reply_markup : {"force_reply": true, "callback_data": "ola"}})
	}
	else if (replyTo == "Please type your last name:") {
		
		ultimoNome = ctx.message.text
		
		bot.telegram.sendMessage(from, "Please type your phone number:" , {reply_markup : {"force_reply": true}})	
	}
	else if (replyTo == "Por favor insira o seu último nome:") {
		
		ultimoNome = ctx.message.text
		
		bot.telegram.sendMessage(from, "Por favor insira o seu número de telefone:" , {reply_markup : {"force_reply": true}})	
	}
	
	else if (replyTo == "Please type your phone number:") {
		telefone = ctx.message.text
		
		createLogs(from,{primeiroNome: primeiroNome,
						ultimoNome : ultimoNome,
						telefone: telefone,
						idioma: "en"})
		
		bot.telegram.sendMessage(from, "Congratulations "+primeiroNome+ " 👏🏼 you are now a member of Club NoSho, the place where the freedom of not making pre-arrangements and spontaneity rules. You will be notified with an alert anytime one of our member restaurants have a last minute table availability. On these alerts, that we like to call “NoSho’s”, you will have the chance to book said restaurant and, if you’re lucky, even receive a discount 😎\n\nClose to the time you wish to dine out, open this chat and be on alert for the NoSho’s that will pop up. If you see one that interests you, just press the “Book” button. You will be immediately notified if you won... or lost 😁 In case of a successful book, you must then show up at the restaurant on the allocated time.")
		
	}
	else if (replyTo == "Por favor insira o seu número de telefone:") {
		telefone = ctx.message.text
		
		createLogs(from,{primeiroNome: primeiroNome,
						ultimoNome : ultimoNome,
						telefone: telefone,
						idioma : "pt"})
		
		bot.telegram.sendMessage(from, "Parabéns "+primeiroNome+" 👏🏼 Bem vindo ao clube NoSho. Aqui reina a espontaneidade e a liberdade de não fazer planos. Irá receber uma notificação sempre que um dos nossos restaurantes aderentes tiver uma mesa vaga de última hora. Nessa notificação, ao qual chamamos de “NoShos”, terá a oportunidade de efectuar a reserva e se tiver sorte, ainda recebe um desconto 😎 \n\nÀ hora que quiser comer fora, abra este chat, e esteja atento aos NoShos que podem surgir. Se vir uma oportunidade que lhe interesse, só precisa de carregar no botão “Reservar”. Será imediatamente avisado se ganhou... ou se perdeu 😁 Em caso de vitória, tem até à hora da reserva para comparecer no restaurante.")
		
	}	
	
	
	else if (replyTo == "Por favor insira o nome do seu restaurante :") {
		nomeRestaurante = ctx.message.text
		
		bot.telegram.sendMessage(from, "Por favor insira a morada (nome da rua + nr de porta):" , {reply_markup : {"force_reply": true}})	


	}

	else if (replyTo == "Por favor insira a morada (nome da rua + nr de porta):" ) {
		
		morada = ctx.message.text
		
		createLogsRest(from,{	nomeRestaurante: nomeRestaurante,
								morada : morada})
								
		bot.telegram.sendMessage(from, "Obrigado e bem vindo ao NoSho.")						
		
	}
	}
})


//GETUPDATES
bot.action(/[0-9]/, (ctx) => {
    
	console.log(ctx.update)
	
	const querydata =ctx.update.callback_query.data.split(" ")
	let command
	command = querydata.splice(0,1)
	console.log(command)
	
	if (command == "register") {
	
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}
	
		const msg = ctx.update.callback_query.data.split(" ")
		console.log(ctx.update.callback_query.data)
		
		const userId = msg[2]
		
		if (msg[1] == "0") {
			
			if (msg[msg.length-1] == "User"){
				
			
				const buttons = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "Português 🇵🇹",
								"callback_data": "register 1 " +userId + " "+msg[msg.length-1]+" pt"            
							}, 
							{
								"text": "English 🇬🇧",
								"callback_data": "register 1 " +userId + " "+msg[msg.length-1]+" en"            
							}
							]
						]
					}
				}

				bot.telegram.sendMessage(userId, "Please choose your language preference:", buttons)
			}
			else {
				bot.telegram.sendMessage(userId, "Por favor insira o nome do seu restaurante :" , {reply_markup : {"force_reply": true}})
			}
		}
		else if (msg[1] == '1') {
		
			if (msg[msg.length-2] == "User") { 
			
				if (msg[msg.length-1] == "pt") {
					bot.telegram.sendMessage(userId, "Por favor insira o seu primeiro nome:" , {reply_markup : {"force_reply": true}})
				}
				else {
					bot.telegram.sendMessage(userId, "Please type your first name:" , {reply_markup : {"force_reply": true}})	
				}
			}
		
		}		
		
	}
			
	else if (command == "nosho") {
			
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}
			
			console.log('entrou na query nosho')
			const msg = ctx.update.callback_query.data.split(" ")
			console.log(ctx.update.callback_query.data)
			
			const sellerId = msg[2]	
			
		if (msg[1] == "0") {
			
			if (msg[msg.length-1] == "Sim") {
		
				infoRest = getOptionsRest(sellerId)
				console.log(infoRest)
				const opts = {
						"reply_markup": {
							"inline_keyboard": [[
								{
									"text": "2",
									"callback_data": "nosho 1 "+sellerId + " "+infoRest.nomeRestaurante+" 2"            
								}, 
								{
									"text": "4",
									"callback_data": "nosho 1 "+sellerId + " "+infoRest.nomeRestaurante+" 4"            
								},
								{
									"text": "6",
									"callback_data": "nosho 1 "+sellerId + " "+infoRest.nomeRestaurante+" 6"             
								},
								{
									"text": "8",
									"callback_data": "nosho 1 "+sellerId + " "+infoRest.nomeRestaurante+" 8"            
								}
								]
							]
						}
					}
				bot.telegram.sendMessage(sellerId, "Para quantas pessoas?" , opts)
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
			
			let info = 	restaurant.split(" ")
			const time = info[info.length-1]
			const people = info[info.length-2]
			
			let restaurant_name
			restaurant_name = info.splice(0, info.length-2)

			restaurant_name = restaurant_name.join(" ")
			
			//regista a reserva
			currentSells.push({
				alreadyBought: false,
				sellerId: sellerId
			})
			
			
			//tratar informaçao ficheiro			
			let data = fs.readFileSync("chats.txt", "utf-8")
			
			let chats = data.split(chatsplit)
			
			let messageIDs 
			
			for (let chat of chats) { 
				
				const params = chat.split(opsplit)
				const language = params[4]
		
				
				if (params[0]) {
					console.log("Vai enviar BOOK ")	
					if (language == 'en') {
		
					
					 bot.telegram.sendMessage( params[0],"Restaurant : "+restaurant_name+"\nTable for : "+people+ "\nTime : " + time,{reply_markup: {
								inline_keyboard: [
								[{text:"Book now ",callback_query:"blz",callback_data:ctx.chat.id+" "+restaurant_name+" "+people+" "+ time+ " "+"0"}]
								]}
								})
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(params[0], result.message_id)
											},900000)
								});
							
				}
				else {
					
					bot.telegram.sendMessage( params[0],"Restaurante : "+restaurant_name+"\nMesa para : "+people+ "\nHora : " + time,{reply_markup: {
								inline_keyboard: [
								[{text:"Reservar ",callback_query:"blz",callback_data:ctx.chat.id+" "+restaurant_name+" "+people+" "+ time+ " "+"0"}]
								]}
								})
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(params[0], result.message_id)
											},900000)
								});
				}	
			}
		}
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
			
			currentSells.push({
				alreadyBought: false,
				sellerId: sellerId
			})
			
			let info = 	restaurant.split(" ")
			const promo = info[info.length-1]
			const time = info[info.length-2]
			const people = info[info.length-3]
			
			let restaurant_name
			restaurant_name = info.splice(0, info.length-3)
			restaurant_name = restaurant_name.join(" ")
			console.log(restaurant_name)
			
			
			//tratar informaçao ficheiro			
			let data = fs.readFileSync("chats.txt", "utf-8")
			
			let chats = data.split(chatsplit)
			
			for (let chat of chats) { 
				
				console.log("LOOP CLIENTES")
				const params = chat.split(opsplit)
				const language = params[4]
				
				
				if (params[0]) {
					
					if (language == 'en') {
						
						bot.telegram.sendMessage( params[0],"Restaurant : "+restaurant_name+"\nTable for : "+people+ "\nTime : " + time+ "\nPromo: "+promo,{reply_markup: {
						inline_keyboard: [
							[{text:"Book now ",callback_query:"blz",callback_data: sellerId+" "+restaurant_name+" "+people+" "+ time+ " "+promo}]
						]}
						})
						.then(function (result) {
					
							interval = setTimeout( () => {
										bot.telegram.deleteMessage(params[0], result.message_id)
									},900000)
						});
					}
					else {
						
						bot.telegram.sendMessage( params[0],"Restaurante : "+restaurant_name+"\nMesa para : "+people+ "\nHora : " + time+ "\nPromoção: "+promo,{reply_markup: {
						inline_keyboard: [
							[{text:"Reservar ",callback_query:"blz",callback_data: sellerId+" "+restaurant_name+" "+people+" "+ time+ " "+promo}]
						]}
						})
						.then(function (result) {
					
							interval = setTimeout( () => {
										bot.telegram.deleteMessage(params[0], result.message_id)
									},900000)
						});
					}	
				}
			}
	}
	}
	
	else
	{
		
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}

		let currentSell
		const msg = ctx.update.callback_query.data.split(" ")
		const sellerId = msg[0]
		
		for (sell of currentSells) {
			if (sell.sellerId = sellerId) {
				currentSell = sell
			}
		}
		
		let restaurant
		restaurant = msg.splice(1, msg.length-4)
		restaurant = restaurant.join(" ")

		const nrPessoas = msg[msg.length-3]
		const hora = msg[msg.length-2]		
		const promo = msg[msg.length-1]
		
		const userId = ctx.update.callback_query.from.id
		const username = ctx.update.callback_query.from.username
		const firstName = ctx.update.callback_query.from.first_name
		
		if (currentSell) {
		
			if (!currentSell.alreadyBought) {
				
				currentSell.alreadyBought = true;
				
				infoCliente = getOptions(userId)
				if (promo == '0'){
					if ( infoCliente.idioma == 'en') {
					
						//Mensagem para o user que reservou
						bot.telegram.sendMessage(userId,"Congratulations "+firstName+" 👏🏼 you were the fastest of all members of the NoSho club to book \""+restaurant+"\" for "+nrPessoas+" people at "+hora+ " !\n\nYour contact has been sent to the restaurant and they are awaiting your arrival. Thank you and enjoy your meal !")
					
					}
					else {
						//Mensagem para o user que reservou
						bot.telegram.sendMessage(userId,"Parabéns "+firstName+" 👏🏼 foi o mais rápido a ganhar este NoSho 👏🏼👏🏼 O restaurante \""+restaurant+"\" para "+nrPessoas+" pessoas às "+hora+ " ficou reservado em seu nome e o seu contacto foi partilhado com o mesmo. Por favor não se atrase 😎 \n\nCaso deseje cancelar esta reserva, pedimos que entre urgentemente em contacto com o restaurante para o avisar. \n\nObrigado e desejamos-lhe uma boa refeição !")
					}	
				}
				else {

					if ( infoCliente.idioma == 'en') {
					
						//Mensagem para o user que reservou
						bot.telegram.sendMessage(userId,"Congratulations "+firstName+" 👏🏼 you were the fastest of all members of the NoSho club to book \""+restaurant+"\" for "+nrPessoas+" people at "+hora+ " with a "+promo+ " discount on all food served (drinks not included). \n\nYour contact has been sent to the restaurant and they are awaiting your arrival. Please don’t be late 😎 in case you wish to cancel, please contact the restaurant to let them know ASAP.\n\nThank you and enjoy your meal !")
					
					}
					else {
						//Mensagem para o user que reservou
						bot.telegram.sendMessage(userId,"Parabéns "+firstName+" 👏🏼 foi o mais rápido a ganhar este NoSho 👏🏼👏🏼 O restaurante \""+restaurant+"\" para "+nrPessoas+" às "+hora+ ", e com uma promoção de " +promo+" na carta (bebidas não incluidas), ficou reservado em seu nome e o seu contacto foi partilhado com o mesmo. Por favor não se atrase 😎 \n\nCaso deseje cancelar esta reserva, pedimos que entre urgentemente em contacto com o restaurante para o avisar. \n\nObrigado e desejamos-lhe uma boa refeição !")
					}	
				}	
					//Mensagem para o restaurante
					ctx.telegram.sendMessage(sellerId,"A mesa foi reservada por:\n\nNome: "+infoCliente.primeiro_nome+ " " +infoCliente.ultimo_nome+ "\n\Número: " +infoCliente.telemovel+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
					currentSell.buyerId = userId								
					currentSells.splice(currentSells.indexOf(sell),1)  
					
				}	
		}	
		else {
			
			infoCliente = getOptions(userId)
				
			if ( infoCliente.idioma == 'en') {
			
				//Mensagem para o user que perdeu a reserva
				bot.telegram.sendMessage(userId,"Oops 🤭 You almost had it "+firstName+"! But someone else was quicker at pressing that button ! Don’t worry though, more NoSho’s will come this way. Just keep a close eye and your fingers ready 😉")
			
			}
			else {
				//Mensagem para o user que reservou
				bot.telegram.sendMessage(userId,"Oops 🤭 Foi por um triz! "+firstName+"! Este NoSho já era, mas não se preocupe que existirão mais oportunidades 😉")
			}
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
            ctx.reply("Message sent!")
            bot.telegram.sendMessage(channel,message)
        } else {
            ctx.reply("Invalid syntax! ")
        }
    }
})


function createLogsRest(id, options) {
    let data = fs.readFileSync("restaurants.txt", "utf-8")
    let rests = data.split(chatsplit)
	let exist = 0
	let args = ""
	const key1 = Object.keys(options)[0]
	const key2 = Object.keys(options)[1]
	
	
	
	for (let chat of rests) {
		
		const params = chat.split(opsplit)
        
		if (params[0] == id) {
            exist = 1 
        }
	}	
	
	if (exist == 0) {
		
		args+=opsplit+options[key1]
		args+=opsplit+options[key2]
		
		data+=chatsplit+id+args
		
		fs.writeFileSync("restaurants.txt",data)
	}
}

function createLogs(id, options) {
    let data = fs.readFileSync("chats.txt", "utf-8")
    let chats = data.split(chatsplit)
	let exist = 0
	let args = ""
	const key1 = Object.keys(options)[0]
	const key2 = Object.keys(options)[1]
	const key3 = Object.keys(options)[2]
	const key4 = Object.keys(options)[3]
	
	
	for (let chat of chats) {
		
		const params = chat.split(opsplit)
        
		if (params[0] == id) {
            exist = 1 
        }
	}	
	
	if (exist == 0) {
		
		args+=opsplit+options[key1]
		args+=opsplit+options[key2]
		args+=opsplit+options[key3]
		args+=opsplit+options[key4]
		data+=chatsplit+id+args
		
		fs.writeFileSync("chats.txt",data)
	}
}

function getOptions(id) {
    const data = fs.readFileSync("chats.txt", "utf-8")
    const chats = data.split(chatsplit)
    for (let chat of chats) {
        const params = chat.split(opsplit)
        if (params[0] == id) {
			
            options = {
                primeiro_nome: params[generalOptions.primeiro_nome],
                ultimo_nome: params[generalOptions.ultimo_nome],
                telemovel: params[generalOptions.telemovel],
                idioma: params[generalOptions.idioma]
            }
			
            return options
        } 
    }
    return undefined
}

function getOptionsRest(id) {
    const data = fs.readFileSync("restaurants.txt", "utf-8")
    const rests = data.split(chatsplit)
    for (let rest of rests) {
        const params = rest.split(opsplit)
        if (params[0] == id) {
			
            options = {
                nomeRestaurante: params[generalOptionsRests.nomeRestaurante],
                morada: params[generalOptionsRests.morada]
            }
			
            return options
        } 
    }
    return undefined
}


function setOptions(id,options) {
    const key = Object.keys(options)[0]
	
    let data = fs.readFileSync("chats.txt", "utf-8")
	
    let chats = data.split(chatsplit)
	
    for (let chat of chats) {
        const params = chat.split(opsplit)
        if (params[0] == id) {
            chat = id
            params[generalOptions[key]] = options[key]
			console.log(params)
            params.map(param => chat+=opsplit+param)
			console.log(chat)
        }
    }
	console.log(data)
	console.log(chats)
    data = chats.join(chatsplit)
	console.log(data)
    fs.writeFileSync("chats.txt",data)
}


bot.launch();