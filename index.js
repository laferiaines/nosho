const Telegraf = require("telegraf");
const fs = require("fs");
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { Client } = require('pg');
const { Pool } = require('pg')
const R = require('ramda');
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



const client = new Client({
  connectionString: process.env.DATABASE_URL
});
	
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})


const PSWD = "ADMIN"
let alreadyBought = false;

let primeiroNome
let nomeRestaurante
let morada


let interval

let noshoIdCount = 0
let currentSells = []



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

bot.command("users", (ctx) => {
	
	let listaUsers


	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM users;', (err, res) => {
		if (err) throw err;
			listaUsers = "Users: "+res.rows.length 
			
			
			for (let row of res.rows) {
			
				listaUsers = listaUsers + "\n" + row.primeiro_nome + " " + row.ultimo_nome + " - " + row.codigopostal + " - " + row.idioma
		
			}
				ctx.reply(listaUsers, show_alert= true);
				console.log(listaUsers);
				client.release();
		})	
	  })

})


bot.command("help", (ctx) => {
	console.log("Comando help")
	const userId = ctx.chat.id
	
	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
		if (err) throw err;
		if (R.head(R.values(res.rows))) {
		
			let idioma = R.head(R.values(res.rows)).idioma
			
			if (idioma == 'en') {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/ByKsk1k', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Next",
																				"callback_data": "help 0 en"            
																			}]]
																			}});
			}
			else {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/BCMJ4nL', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Próximo",
																				"callback_data": "help 0 pt"            
																			}]]
																			}});
				
			}
		}		
		client.release()
		})})		
})



bot.command("restaurantes", (ctx) => {
	console.log("Comando restaurantes ")
	let listaRest


	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM restaurantes;', (err, res) => {
		if (err) throw err;
			for (let row of res.rows) {
				if (listaRest) {
					listaRest = listaRest + "\n" + row.nome 
				}
				else {
					listaRest = row.nome 
				}	

			}
				ctx.reply(listaRest);
				console.log(listaRest);
				client.release();
		})
	  })
})

bot.command("nosho", (ctx) => {
	console.log("Comando NoSho ")
	const sellerId = ctx.chat.id
	
	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM restaurantes where chatid = ' +sellerId+';', (err, res) => {
				if (err) throw err;
				if (R.head(R.values(res.rows))) {

					let nome_Restaurante = R.head(R.values(res.rows)).nome
					noshoIdCount = noshoIdCount + 1
			
					bot.telegram.sendMessage(sellerId, "Para quantas pessoas?" , {
																		"reply_markup": {
																			"inline_keyboard": [[
																				{
																					"text": "1",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 1"            
																				}, 
																				{
																					"text": "2",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 2"            
																				},
																				{
																					"text": "3",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 3"             
																				},
																				{
																					"text": "4",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 4"            
																				},
																				{
																					"text": "5",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 5"            
																				},
																				{
																					"text": "6",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 6"            
																				}
																				],
																				[
																				{
																					"text": "2-4",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 2-4"            
																				},
																				{
																					"text": "4-6",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 4-6"            
																				},
																				{
																					"text": "4-8",
																					"callback_data": "nosho 1 "+noshoIdCount+" "+sellerId + " "+nome_Restaurante+" 4-8"            
																				}
																				]
																			]
																		}
								})
				}
				else{
					
					bot.telegram.sendMessage(sellerId, "Por favor, registe se primeiro como Restaurante. Obrigado.")
					
				}
				client.release();
			})
		})	
})


bot.on('message', (ctx) => {
	console.log(ctx.message.reply_to_message)	
	
	if (ctx.message.reply_to_message) {
		
		const from = ctx.update.message.chat.id
		console.log(ctx.message)
		const replyTo = ctx.message.reply_to_message.text
		
	
		if (replyTo == "Please type your first name:") {
			primeiroNome = ctx.message.text
			updateUserInfo(from, 'primeiro_nome', ctx.message.text)
			
			bot.telegram.sendMessage(from, "Please type your last name:" , {reply_markup : {"force_reply": true}})
		}	
		else if (replyTo == "Por favor insira o seu primeiro nome:") {	
			primeiroNome = ctx.message.text
			updateUserInfo(from, 'primeiro_nome', ctx.message.text)
			
			bot.telegram.sendMessage(from, "Por favor insira o seu último nome:" , {reply_markup : {"force_reply": true}})
		}
		else if (replyTo == "Please type your last name:") {
			
			updateUserInfo(from, 'ultimo_nome', ctx.message.text)
			
			bot.telegram.sendMessage(from, "Please type your phone number:" , {reply_markup : {"force_reply": true}})	
		}
		else if (replyTo == "Por favor insira o seu último nome:") {
			
			updateUserInfo(from, 'ultimo_nome', ctx.message.text)
			
			bot.telegram.sendMessage(from, "Por favor insira o seu número de telefone:" , {reply_markup : {"force_reply": true}})	
		}
		
		else if (replyTo == "Please type your phone number:") {
			

			updateUserInfo(from, 'telefone', ctx.message.text)

			bot.telegram.sendMessage(from, "Please type your postal code:" , {reply_markup : {"force_reply": true}})		
			
		}
		else if (replyTo == "Por favor insira o seu número de telefone:") {
			
			updateUserInfo(from, 'telefone', ctx.message.text)
	
			bot.telegram.sendMessage(from, "Por favor insira o seu código postal:" , {reply_markup : {"force_reply": true}})
			
		}	
	
		else if (replyTo == "Por favor insira o seu código postal:") {
			
			updateUserInfo(from, 'codigopostal', ctx.message.text)
	
			bot.telegram.sendMessage(from, "Por favor insira o seu email:" , {reply_markup : {"force_reply": true}})	
			
		}			
		else if (replyTo == "Please type your postal code:") {
			
			updateUserInfo(from, 'codigopostal', ctx.message.text)
		
			bot.telegram.sendMessage(from, "Please type your email:" , {reply_markup : {"force_reply": true}})	
			
		}		
		else if (replyTo == "Por favor insira o seu email:") {
			
			updateUserInfo(from, 'email', ctx.message.text)
	
			bot.telegram.sendMessage(from, 	"Parabéns "+primeiroNome+ "👏🏼 está registado e pronto a usufruir do NoSho. Para perceber como isto aqui funciona, deixe-me convidá-lo para um tutorial muito rápido. É só clicar /help")
			
		}
		else if (replyTo == "Please type your email:") {
			
			updateUserInfo(from, 'email', ctx.message.text)
	
			bot.telegram.sendMessage(from, "Congratulations "+primeiroNome+ " 👏🏼 you are now ready to use NoSho. To better understand how things work around here, let me invite you to a quick tutorial tour. Just press /help")
		}		
		
	
		else if (replyTo == "Por favor insira o nome do seu restaurante :") {
			
			setRestInfo(from, ctx.message.text, '')
			bot.telegram.sendMessage(from, "Por favor insira a morada (nome da rua + nr de porta):" , {reply_markup : {"force_reply": true}})	

		}

		else if (replyTo == "Por favor insira a morada (nome da rua + nr de porta):" ) {
			
			morada = ctx.message.text
			updateRestInfo(from, 'morada', morada)
			
			bot.telegram.sendMessage(from, "Obrigado e bem vindo ao NoSho.")						
			
			
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM restaurantes where chatid = '+from+';', (err, res) => {
				if (err) throw err;
				
				
					let nome
					
					
					if (R.head(R.values(res.rows))) {
						
						nome = R.head(R.values(res.rows)).nome
						
					
						bot.telegram.sendMessage(774081606, "Chef Salvador, seu deus da cozinha, um novo restaurante acabou de se registar: \n\nNome: "+nome+"\nMorada: "+morada)
						bot.telegram.sendMessage(1158169804, "Deusa Inês, um novo restaurante acabou de se registar: \n\nNome: "+nome+"\nMorada: "+morada)
						bot.telegram.sendMessage(1348824388, "Um novo restaurante acabou de se registar: \n\nNome: "+nome+"\nMorada: "+morada)
					}
					client.release();
					})
				})

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
	
	if (command == 'help'){
		
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}
		
		const userId = ctx.update.callback_query.from.id
		const msg = ctx.update.callback_query.data.split(" ")
		
		if (msg[1] == 0) { 
		
			pool.connect()
			.then(client => {
				return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
			if (err) throw err;
		
			let idioma = R.head(R.values(res.rows)).idioma
			
			if (idioma == 'en') {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/nB9tdtF', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Next",
																				"callback_data": "help 1 en"            
																			}]]
																			}});
			}
			else {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/tLd43xC', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Próximo",
																				"callback_data": "help 1 pt"            
																			}]]
																			}});
				
			}
			})})
		}
		else if (msg[1] == 1) {
			
			pool.connect()
			.then(client => {
				return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
			if (err) throw err;
		
			let idioma = R.head(R.values(res.rows)).idioma
			
			if (idioma == 'en') {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/ngtGZgp', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Next",
																				"callback_data": "help 2 en"            
																			}]]
																			}});
			}
			else {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/tzbvzy9', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Próximo",
																				"callback_data": "help 2 pt"            
																			}]]
																			}});
				
			}
			})})	
			
			
		}
		else if (msg[1] == 2) {
			
			pool.connect()
			.then(client => {
				return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
			if (err) throw err;
		
			let idioma = R.head(R.values(res.rows)).idioma
			
			if (idioma == 'en') {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/bdvkBLt', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Next",
																				"callback_data": "help 3 en"            
																			}]]
																			}});
			}
			else {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/P5Pd03w', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Próximo",
																				"callback_data": "help 3 pt"            
																			}]]
																			}});
				
			}
			})})	
			
			
		}
		else if (msg[1] == 3) {
			
			pool.connect()
			.then(client => {
				return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
			if (err) throw err;
		
			let idioma = R.head(R.values(res.rows)).idioma
			
			if (idioma == 'en') {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/0jFHgL8', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Next",
																				"callback_data": "help 4 en"            
																			}]]
																			}});
			}
			else {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/vsQzgT0', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Próximo",
																				"callback_data": "help 4 pt"            
																			}]]
																			}});
				
			}
			})})	
			
			
		}
		else if (msg[1] == 4) {
			
			pool.connect()
			.then(client => {
				return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
			if (err) throw err;
		
			let idioma = R.head(R.values(res.rows)).idioma
			
			if (idioma == 'en') {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/fnGFYhs', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "The end",
																				"callback_data": "help 5 en"            
																			}]]
																			}});
			}
			else {
				bot.telegram.sendPhoto(userId, 'https://ibb.co/gzFmxfR', { "reply_markup": {
																			"inline_keyboard": [[
																			{
																				"text": "Fim",
																				"callback_data": "help 5 pt"            
																			}]]
																			}});
				
			}
			})})	
			
			
		}
		else{
			console.log('Fim tutoria')
		}
	}
	
	else if (command == "register") {
	
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
					setUserInfo(userId, '', '', '', 'pt', '', '')
					bot.telegram.sendMessage(userId, "Por favor insira o seu primeiro nome:" , {reply_markup : {"force_reply": true}})
				}
				else {
					setUserInfo(userId, '', '', '', 'en', '', '')
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
			
			let sellerId = msg[2]	
			

		if (msg[1] == "1") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]
			
			let calldata
			calldata = msg.splice(2,msg.length-1)
			console.log(calldata)
			let restaurant
			restaurant = calldata.splice(2, calldata.length-1)
			restaurant = restaurant.join(" ")
			console.log(restaurant)
			
			const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "Sim",
							"callback_data": "nosho 2 "+noshoId+" " +sellerId+ " " +restaurant+ " S"            
						}, 
						{
							"text": "Não",
							"callback_data": "nosho 2 "+noshoId+" " +sellerId+ " " +restaurant+ " N"        
						}
						]
					]
				}
			}	
	
			bot.telegram.sendMessage(sellerId, "É uma mesa de exterior?" , opts)
		}
		
	else if (msg[1] == "2") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]
			
			let calldata
			calldata = msg.splice(2,msg.length-2)

			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-1)
			restaurant = restaurant.join(" ")
			
				
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "10",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 10"            
							}, 
							{
								"text": "11",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 11"            
							},
							{
								"text": "12",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 12"            
							}, 		
							{
								"text": "13",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 13"            
							},
							{
								"text": "14",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 14"            
							},
							{
								"text": "15",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+  " 15"            
							},
							
							{
								"text": "16",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 16"            
							}],
							[{
								"text": "17",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 17"            
							},{
								"text": "18",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 18"            
							},{
								"text": "19",
								"callback_data": "nosho 2.1 "+noshoId+" "  +sellerId+ " " +restaurant+ " 19"            
							},{
								"text": "20",
								"callback_data": "nosho 2.1 "+noshoId+" "  +sellerId+ " " +restaurant+ " 20"            
							},{
								"text": "21",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 21"            
							},{
								"text": "22",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 22"            
							},{
								"text": "23",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " " +restaurant+ " 23"            
							}							
							]
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Hora?" , opts)
		

	}
	else if (msg[1] == "2.1") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]
			
			let calldata
			calldata = msg.splice(2,msg.length-2)

			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-1)
			restaurant = restaurant.join(" ")
			
				
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "00",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+ " " +restaurant+ " 00"            
							}, 
							{
								"text": "15",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+ " " +restaurant+ " 15"            
							},
							{
								"text": "30",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+ " " +restaurant+ " 30"            
							}, 		
							{
								"text": "45",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+ " " +restaurant+ " 45"            
							}							
							]
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Minutos?" , opts)
		

	}
	
	else if (msg[1] == "3") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]
			
			let calldata
			calldata = msg.splice(2,msg.length-1)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(3, calldata.length-2)
			restaurant = restaurant.join(" ")
			console.log(restaurant)
			const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "Sim",
							"callback_data": "nosho 4 "  +noshoId+" " +sellerId+ " " +restaurant+ " S"            
						}, 
						{
							"text": "Não",
							"callback_data": "nosho 4 "  +noshoId+" " +sellerId+ " " +restaurant+ " N"        
						}
						]
					]
				}
			}	
	
			bot.telegram.sendMessage(sellerId, "Deseja aplicar uma promoção?" , opts)
		}

	else if (msg[1] == "4") {
			
		console.log(msg)
		sellerId = msg[3]
		noshoId = msg[2]
		
		let calldata
		calldata = msg.splice(1,msg.length-2)
		
		let restaurant
		restaurant = calldata.splice(2, calldata.length-1)
		restaurant = restaurant.join(" ")
			
		if ( msg[msg.length-1] == "S" ) {
				
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "5%",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " " +restaurant+ " 5%"            
							}, 
							{
								"text": "10%",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " " +restaurant+ " 10%"            
							},
							{
								"text": "15%",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " " +restaurant+ " 15%" 
							}], 		
							[{
								"text": "20%",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " " +restaurant+ " 20%"
							},
							{
								"text": "25%",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " " +restaurant+ " 25%"
							},
							{
								"text": "50%",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " " +restaurant+ " 50%"
							}]
							
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Escolha um dos valores:" , opts)
		}
		else {
			
			console.log("enviar mensagem sem promo")
			
			let info = 	restaurant.split(" ")	
			const hora = info[info.length-2]
			const minutos = info[info.length-1]
			const people = info[info.length-4]
			const exterior = info[info.length-3]			
			
			
			console.log("PUSH ID " + noshoId)
			//regista a reserva
			currentSells.push({
				alreadyBought: false,
				sellerId: sellerId,
				noshoId: noshoId
			})
			
			
			let nome
			let morada
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM restaurantes where chatid = '+sellerId+';', (err, res) => {
				if (err) throw err;
					if (R.head(R.values(res.rows))) {
						nome = R.head(R.values(res.rows)).nome
						morada = R.head(R.values(res.rows)).morada
					}
					client.release();

		
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM users;', (err, res) => {
				if (err) throw err;
				
					for (let row of res.rows) {
						
						if (exterior == 'N') {
						if (row.idioma == 'en') {
		
					
							bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nTable for : "+people+ "\nTime : " + hora+":"+minutos, {parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
								[{text:"Book now ",callback_query:"blz",callback_data:noshoId+" "+ctx.chat.id+" "+nome+" "+people+" "+  hora+":"+minutos+ " "+"0"}]
								]}
								})
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
							
						}
						else {
					
							bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa para : "+people+ "\nHora : "  + hora+":"+minutos,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
								[{text:"Reservar ",callback_query:"blz",callback_data:noshoId+" "+ctx.chat.id+" "+nome+" "+people+" "+  hora+":"+minutos+ " "+"0"}]
								]}
								})
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
						}
						}
					else {
						if (row.idioma == 'en') {
		
					
							bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nOutdoor Table for : "+people+ "\nTime : " + hora+":"+minutos, {parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
								[{text:"Book now ",callback_query:"blz",callback_data:noshoId+" "+ctx.chat.id+" "+nome+" "+people+" "+  hora+":"+minutos+ " "+"0"}]
								]}
								})
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
							
						}
						else {
					
							bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa exterior para : "+people+ "\nHora : "  + hora+":"+minutos,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
								[{text:"Reservar ",callback_query:"blz",callback_data:noshoId+" "+ctx.chat.id+" "+nome+" "+people+" "+  hora+":"+minutos+ " "+"0"}]
								]}
								})
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
						}
					}	

					}
					client.release();
					bot.telegram.sendMessage( sellerId,"O seu NoSho foi publicado com sucesso.")
				})	
			  })
		
					})
				})		
			}
		}
		
	else if (msg[1] == "5") {
	
			console.log("enviar mensagem promo")
			sellerId = msg[3]
			noshoId = msg[2]
			
			let calldata
			calldata = msg.splice(1,msg.length-1)
			console.log(calldata)
			
			let restaurant
			restaurant = calldata.splice(2, calldata.length-2)
			restaurant = restaurant.join(" ")
			console.log("PUSH ID " + noshoId)
			currentSells.push({
				alreadyBought: false,
				sellerId: sellerId,
				noshoId: noshoId
			})
			
			let info = 	restaurant.split(" ")
			const promo = info[info.length-1]
			const hora = info[info.length-3]
			const minutos = info[info.length-2]
			const people = info[info.length-5]
			const exterior = info[info.length-4]
			
					
			let nome
			let morada
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM restaurantes where chatid = '+sellerId+';', (err, res) => {
				if (err) throw err;
					if (R.head(R.values(res.rows))) {
						nome = R.head(R.values(res.rows)).nome
						morada = R.head(R.values(res.rows)).morada
					}
					client.release();
			
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM users;', (err, res) => {
				if (err) throw err;
					for (let row of res.rows) {
						if (exterior == 'S') {
							console.log("Vai enviar BOOK ")	
							if (row.idioma == 'en') {
							
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nOutdoor Table for : "+people+ "\nTime : " + hora+":"+minutos+ "\nPromo: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Book now ",callback_query:"blz",callback_data: noshoId+" "+sellerId+" "+nome+" "+people+" "+ hora+":"+minutos+ " "+promo}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
							}
							else {
								
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa exterior para : "+people+ "\nHora : " + hora+":"+minutos+ "\nPromoção: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Reservar ",callback_query:"blz",callback_data: noshoId+" "+sellerId+" "+nome+" "+people+" "+ hora+":"+minutos+ " "+promo}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
							}
						}
						else {
							
							if (row.idioma == 'en') {
							
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nTable for : "+people+ "\nTime : " + hora+":"+minutos+ "\nPromo: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Book now ",callback_query:"blz",callback_data: noshoId+" "+sellerId+" "+nome+" "+people+" "+ hora+":"+minutos+ " "+promo}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
							}
							else {
								
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa para : "+people+ "\nHora : " + hora+":"+minutos+ "\nPromoção: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Reservar ",callback_query:"blz",callback_data: noshoId+" "+sellerId+" "+nome+" "+people+" "+ hora+":"+minutos+ " "+promo}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(row.chatid, result.message_id)
											},1500000)
								});
							}	
						}		
				}
				bot.telegram.sendMessage( sellerId,"O seu NoSho foi publicado com sucesso.")
				client.release();
				})})
			})	
					
				})				
		
	}
	}
	
	else
	{
		
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}

		let currentSell
		const msg = ctx.update.callback_query.data.split(" ")
		const sellerId = msg[1]
		
		const noshoMsgId = msg[0]
		console.log("NOSHOID: " + noshoMsgId)
		
		for (sell of currentSells) {
			
			if (sell.sellerId == sellerId && sell.noshoId == noshoMsgId) {
				console.log("ENCONTROU NOSHO")
				currentSell = sell
			}
		}
		
		let restaurant
		restaurant = msg.splice(2, msg.length-5)
		restaurant = restaurant.join(" ")

		const nrPessoas = msg[msg.length-3]
		const hora = msg[msg.length-2]		
		const promo = msg[msg.length-1]
		const userId = ctx.update.callback_query.from.id

		
		if (currentSell) {
		
			if (!currentSell.alreadyBought) {
				
				currentSell.alreadyBought = true;
				
											
				let latitude
				let longitude
				//buscar info restaurante sellerId
				pool.connect()
					.then(client => {
						return client.query('SELECT * FROM restaurantes where chatid = '+sellerId+';', (err, res) => {
					if (err) throw err;
						if (R.head(R.values(res.rows))) {
							latitude = R.head(R.values(res.rows)).latitude
							longitude = R.head(R.values(res.rows)).longitude
						}
						client.release();

				
				
				
				let nome
				let idioma
				let telemovel
				let ultimoNome
				pool.connect()
					.then(client => {
						return client.query('SELECT * from users where chatid = '+ userId+ ';', (err, res) => {
							
							console.log('SELECT * from users where chatid = '+ userId+ ');')
							nome = R.head(R.values(res.rows)).primeiro_nome
							ultimoNome = R.head(R.values(res.rows)).ultimo_nome
							idioma = R.head(R.values(res.rows)).idioma
							telemovel = R.head(R.values(res.rows)).telefone
							
							client.release();
							
							if (promo == '0'){
								if ( idioma == 'en') {
								
									//Mensagem para o user que reservou
									bot.telegram.sendMessage(userId,"Congratulations "+nome+" 👏🏼 you were the fastest of all members of the NoSho club to book \""+restaurant+"\" for "+nrPessoas+" people at "+hora+ " !\n\nYour contact has been sent to the restaurant and they are awaiting your arrival. Please don’t be late 😎 ")
									.then(function (result) {				
										interval = setTimeout( () => {
													bot.telegram.deleteMessage(userId, result.message_id)
												},43200000)
												
										bot.telegram.sendLocation(userId, latitude, longitude)
										bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
										bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
									});
									
									
									
								}
								else {
									//Mensagem para o user que reservou
									bot.telegram.sendMessage(userId,"Parabéns "+nome+" 👏🏼 foi o mais rápido a ganhar este NoSho 👏🏼👏🏼 O restaurante \""+restaurant+"\" para "+nrPessoas+" pessoas às "+hora+ " ficou reservado em seu nome e o seu contacto foi partilhado com o mesmo. Por favor não se atrase 😎 ")
									.then(function (result) {
											interval = setTimeout( () => {
														bot.telegram.deleteMessage(userId, result.message_id)
													},43200000)
													
											bot.telegram.sendLocation(userId, latitude, longitude)
											bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
											bot.telegram.sendMessage(1158169804, "🎉O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)			
											bot.telegram.sendMessage(1348824388, "🎉O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)			
										});
									
								}	
								}
								else {

									if ( idioma == 'en') {
									
										//Mensagem para o user que reservou
										bot.telegram.sendMessage(userId,"Congratulations "+nome+" 👏🏼 you were the fastest of all members of the NoSho club to book \""+restaurant+"\" for "+nrPessoas+" people at "+hora+ " with a "+promo+ " discount on all food served (drinks not included). \n\nYour contact has been sent to the restaurant and they are awaiting your arrival. Please don’t be late 😎 ")
										.then(function (result) {
											interval = setTimeout( () => {
														bot.telegram.deleteMessage(userId, result.message_id)
													},43200000)
											bot.telegram.sendLocation(userId, latitude, longitude)
											bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
											bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
											bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										});
										
									}
									else {
										//Mensagem para o user que reservou
										bot.telegram.sendMessage(userId,"Parabéns "+nome+" 👏🏼 foi o mais rápido a ganhar este NoSho 👏🏼👏🏼 O restaurante \""+restaurant+"\" para "+nrPessoas+" pessoas às "+hora+ ", e com uma promoção de " +promo+" na carta (bebidas não incluidas), ficou reservado em seu nome e o seu contacto foi partilhado com o mesmo. Por favor não se atrase 😎 ")
										.then(function (result) {
											interval = setTimeout( () => {
														bot.telegram.deleteMessage(userId, result.message_id)
													},43200000)
											bot.telegram.sendLocation(userId, latitude, longitude)
											bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
											bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
											bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+restaurant+ " para "+nrPessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										});
										
									}	
								}	
									//Mensagem para o restaurante
									ctx.telegram.sendMessage(sellerId,"A mesa foi reservada por:\n\nNome: "+nome+ " " +ultimoNome+ "\n\Número: " +telemovel+"\nMesa para: "+nrPessoas+"\nPromo: "+promo+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
									.then(function (result) {
										interval = setTimeout( () => {
													bot.telegram.deleteMessage(userId, result.message_id)
												},43200000)
									});
									currentSell.buyerId = userId								
									//currentSells.splice(currentSells.indexOf(sell),1)  
						
							})
					})
											})
					})	
				}	
			
		else {
			
			let nome
			let idioma
				pool.connect()
					.then(client => {
						return client.query('SELECT * from users where chatid = '+ userId+ ';', (err, res) => {
							
							console.log('SELECT * from users where chatid = '+ userId+ ');')
							nome = R.head(R.values(res.rows)).primeiro_nome
							idioma = R.head(R.values(res.rows)).idioma
							
							client.release();
				
							if ( idioma == 'en') {
							
								//Mensagem para o user que perdeu a reserva
								bot.telegram.sendMessage(userId,"Oops 🤭 You almost had it "+nome+"! But someone else was quicker at pressing that button ! Don’t worry though, more NoSho’s will come this way. Just keep a close eye and your fingers ready 😉")
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(userId, result.message_id)
											},43200000)
								});
							
							}
							else {
								//Mensagem para o user que reservou
								bot.telegram.sendMessage(userId,"Oops 🤭 Foi por um triz! "+nome+"! Este NoSho já era, mas não se preocupe que existirão mais oportunidades 😉")
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(userId, result.message_id)
											},43200000)
								});
							}
						})
					})	
		}
		}
	}
})


function 
	updateUserInfo(chatid, field, value){
	
	
		pool.connect()
		.then(client => {
			return client.query('SELECT FROM users where chatid = '+chatid+ ';', (err, res) => {
					
					console.log('SELECT FROM users where chatid = '+chatid+ ';')
					client.release();
					if (R.head(R.values(res.rows))) {
						pool.connect()
						.then(client => {
							return client.query('UPDATE users set ' +field+ ' = \''+ value+'\' where chatid = '+chatid+ ';' , (err, res) => {
									
									console.log('UPDATE users set ' +field+ ' = \''+ value+'\' where chatid = '+chatid+ ';')
									
									client.release();
									})
						});	
					}
					
		})})
}

function 
	updateRestInfo(chatid, field, value){
	
	
		pool.connect()
		.then(client => {
			return client.query('SELECT FROM restaurantes where chatid = '+chatid+ ';', (err, res) => {
					
					console.log('SELECT FROM restaurantes where chatid = '+chatid+ ';')
				
					client.release();
					if (R.head(R.values(res.rows))) {
						pool.connect()
						.then(client => {
							return client.query('UPDATE restaurantes set ' +field+ ' = \''+ value+'\' where chatid = '+chatid+ ';' , (err, res) => {
									
									console.log('UPDATE restaurantes set ' +field+ ' = \''+ value+'\' where chatid = '+chatid+ ';')
									client.release();
									})
						});	
					}
					
		})})
}


function 
	setUserInfo(chatid, primeiroNome, ultimoNome, telefone, idioma, codigoPostal, email){
	
	
		pool.connect()
		.then(client => {
			return client.query('SELECT FROM users where chatid = '+chatid+ ';', (err, res) => {
					
					console.log('SELECT FROM users where chatid = '+chatid+ ';')
					client.release();
					if (R.head(R.values(res.rows))) {
						console.log("User já existe")	
					}
					else {
						
						pool.connect()
						.then(client => {
							return client.query('INSERT INTO users(chatid, primeiro_nome, ultimo_nome, telefone, codigopostal, email, idioma) values(' +chatid+ ',\'' +primeiroNome+'\',\'' +  ultimoNome+ '\',\'' + telefone + '\',\'' +codigoPostal+ '\',\'' +email+ '\', \''+idioma+'\');', (err, res) => {
									
									console.log('INSERT INTO users values(' +chatid+ ',\'' +primeiroNome+'\',\'' +  ultimoNome+ '\',\'' + telefone + '\',\'' +codigoPostal+ '\',\'' +email+ '\', \''+idioma+'\');')
									
									client.release();
									})
						});	
						
					}
		})})
}	
	
	
function 
	setRestInfo(chatid, nome, morada){
	
	
		pool.connect()
		.then(client => {
			return client.query('SELECT FROM restaurantes where chatid = '+chatid+ ';', (err, res) => {
					
					console.log('SELECT FROM restaurantes where chatid = '+chatid+ ';')
					client.release();
					if (R.head(R.values(res.rows))) {
						console.log("Rest já existe")	
					}
					else {
						
						pool.connect()
						.then(client => {
							return client.query('INSERT INTO restaurantes values(' +chatid+ ',\'' +nome+'\',\'' +  morada+'\');', (err, res) => {
									
									console.log('INSERT INTO restaurantes values(' +chatid+ ',\'' +nome+'\',\'' +  morada+'\');')
								
									client.release();
									})
						});	
						
					}
		})})
}	
	
	
/*
bot.command("text", (ctx) => {
	
	let listaUsers
	let req = ctx.message.text.split(" ")

	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM users;', (err, res) => {
		if (err) throw err;
			for (let row of res.rows) {
				//bot.telegram.sendMessage(row.chatid, "Olá " + row.primeiro_nome)
				if (listaUsers) {
					listaUsers = listaUsers + "\n" + row.primeiro_nome + " " + row.ultimo_nome
				
				}
				else {
					listaUsers = row.primeiro_nome + " " + row.ultimo_nome
			
				}	

			}
				ctx.reply(listaUsers);
				console.log(listaUsers);
				client.release();
		})	
	  })

})

*/

bot.launch();