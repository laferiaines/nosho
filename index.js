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

let primeiroNome
let nomeRestaurante
let morada

let interval

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



bot.command("text", (ctx) => {
	
		
	console.log('Comando text')
	let req = ctx.message.text.split(" ")
	
	req.splice(0,1)
    message = req.join(" ")

	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM users;', (err, res) => {
		if (err) throw err;
		console.log('SELECT * FROM users;')
		console.log(message)
			for (let row of res.rows) {
				bot.telegram.sendMessage(row.chatid, message)
			}
				client.release();
		})	
	  })
	
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
	
	let noshoIdCount
	pool.connect()
		.then(client => {
			return client.query('SELECT MAX(ID) FROM noshos;', (err, res) => {
					
					if (R.head(R.values(res.rows)).max) {
						noshoIdCount = R.head(R.values(res.rows)).max + 1
					}
					
						
					client.release();
		console.log("noshoIdCount "+noshoIdCount)
	pool.connect()
		.then(client => {
			return client.query('SELECT * FROM restaurantes where chatid = ' +sellerId+';', (err, res) => {
				if (err) throw err;
				if (R.head(R.values(res.rows))) {
					let nome_Restaurante = R.head(R.values(res.rows)).nome
					let morada = R.head(R.values(res.rows)).morada
					client.release()
					
					console.log("nome_Restaurante "+nome_Restaurante)
					
					pool.connect()
						.then(client => {
							return client.query('INSERT INTO noshos(id, sellerid, booked, nome, morada, promo) values('+ noshoIdCount+','+sellerId+',0,\''+nome_Restaurante+'\',\''+morada+'\',\'0\');', (err, res) => {
								if (err) throw err;
								console.log('INSERT INTO noshos(id, sellerid, booked, nome, morada, promo) values('+ noshoIdCount+','+sellerId+',0,\''+nome_Restaurante+'\',\''+morada+'\',\'0\');')
								client.release()
					
			
						bot.telegram.sendMessage(sellerId, "Para quantas pessoas?" , {
																			"reply_markup": {
																				"inline_keyboard": [[
																					{
																						"text": "1",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 1"            
																					}, 
																					{
																						"text": "2",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 2"            
																					},
																					{
																						"text": "3",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 3"             
																					},
																					{
																						"text": "4",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 4"            
																					},
																					{
																						"text": "5",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 5"            
																					},
																					{
																						"text": "6",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 6"            
																					}
																					],
																					[
																					{
																						"text": "2-4",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 2-4"            
																					},
																					{
																						"text": "4-6",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 4-6"            
																					},
																					{
																						"text": "4-8",
																						"callback_data": "nosho 1 "+noshoIdCount+ " "+sellerId+" 4-8"            
																					}
																					]
																				]
																			}
									})				
				})})}
				
				else{
					
					bot.telegram.sendMessage(sellerId, "Por favor, registe se primeiro como Restaurante. Obrigado.")
					
				}
			})})
		})})
		
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
			client.release();
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
			client.release();
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
			client.release();
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
			client.release();
			})})	
			
			
		}
		else if (msg[1] == 4) {
			
			pool.connect()
			.then(client => {
				return client.query('SELECT * FROM users where chatid = '+userId+ ';', (err, res) => {
			if (err) throw err;
		
			let idioma = R.head(R.values(res.rows)).idioma
			client.release()
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
	else if (command == 'cancelar') {
		console.log("comando cancelar")
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}
		const msg = ctx.update.callback_query.data.split(" ")	
		const sellerId = ctx.update.callback_query.from.id	
		const noshoId = msg[1]
		const people = msg[2]
		const horas = msg[3]
		
		pool.connect()
			.then(client => {
				return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
					if (err) throw err;
					console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
					bot.telegram.sendMessage( sellerId,"O seu NoSho para "+people+" ás "+horas+" foi cancelado com sucesso.")	
					client.release()		
			})})
		
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
			
			console.log('Comando NoSho')
			const msg = ctx.update.callback_query.data.split(" ")
			console.log(ctx.update.callback_query.data)
			
			let noshoId = msg[2]	
			let sellerId = msg[3]

		if (msg[1] == "1") {

								
			pool.connect()
				.then(client => {
					return client.query('UPDATE noshos set pessoas = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
						if (err) throw err;
						console.log('UPDATE noshos set pessoas = \''+ msg[4]+'\' where id = '+noshoId+';')
						client.release()
					
			
			const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "Sim",
							"callback_data": "nosho 2 "+noshoId+ " "+sellerId+" S"            
						}, 
						{
							"text": "Não",
							"callback_data": "nosho 2 "+noshoId+ " "+sellerId+" N"        
						}
						]
					]
				}
			}	
	
			bot.telegram.sendMessage(sellerId, "É uma mesa de exterior?" , opts)
			
			})})
		}
		
	else if (msg[1] == "2") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]
			
			pool.connect()
				.then(client => {
					return client.query('UPDATE noshos set exterior = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
						if (err) throw err;
						console.log('UPDATE noshos set exterior = \''+ msg[4]+'\' where id = '+noshoId+';')
						client.release()
			
				
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "10",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " 10"            
							}, 
							{
								"text": "11",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " 11"            
							},
							{
								"text": "12",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " 12"            
							}, 		
							{
								"text": "13",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+ " 13"            
							},
							{
								"text": "14",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 14"            
							},
							{
								"text": "15",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+   " 15"            
							},
							
							{
								"text": "16",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 16"            
							}],
							[{
								"text": "17",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 17"            
							},{
								"text": "18",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 18"            
							},{
								"text": "19",
								"callback_data": "nosho 2.1 "+noshoId+" "  +sellerId+  " 19"            
							},{
								"text": "20",
								"callback_data": "nosho 2.1 "+noshoId+" "  +sellerId+  " 20"            
							},{
								"text": "21",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 21"            
							},{
								"text": "22",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 22"            
							},{
								"text": "23",
								"callback_data": "nosho 2.1 " +noshoId+" " +sellerId+  " 23"            
							}							
							]
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Hora?" , opts)
		})})

	}
	else if (msg[1] == "2.1") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]

			pool.connect()
				.then(client => {
					return client.query('UPDATE noshos set horas = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
						if (err) throw err;
						console.log('UPDATE noshos set horas = \''+ msg[4]+'\' where id = '+noshoId+';')
						client.release()

			
				const opts = {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "00",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+  " 00"            
							}, 
							{
								"text": "15",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+  " 15"            
							},
							{
								"text": "30",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+  " 30"            
							}, 		
							{
								"text": "45",
								"callback_data": "nosho 3 " +noshoId+" " +sellerId+  " 45"            
							}							
							]
						]
					}
				}	
	
			bot.telegram.sendMessage(sellerId, "Minutos?" , opts)
		})})

	}
	
	else if (msg[1] == "3") {
			
			console.log(msg)
			sellerId = msg[3]
			noshoId = msg[2]

			pool.connect()
				.then(client => {
					return client.query('UPDATE noshos set minutos = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
						if (err) throw err;
						console.log('UPDATE noshos set minutos = \''+ msg[4]+'\' where id = '+noshoId+';')
						client.release()

			const opts = {
				"reply_markup": {
					"inline_keyboard": [[
						{
							"text": "Sim",
							"callback_data": "nosho 4 "  +noshoId+" " +sellerId+ " S"            
						}, 
						{
							"text": "Não",
							"callback_data": "nosho 4.1 "  +noshoId+" " +sellerId+  " N"        
						}
						]
					]
				}
			}	
	
			bot.telegram.sendMessage(sellerId, "Deseja aplicar uma promoção?" , opts)
		})})	
			
		}

	else if (msg[1] == "4") {
			
		console.log(msg)
		sellerId = msg[3]
		noshoId = msg[2]
						
						
		const opts = {
			"reply_markup": {
				"inline_keyboard": [[
					{
						"text": "5%",
						"callback_data": "nosho 4.2 "  +noshoId+" "  +sellerId+  " 5%"            
					}, 
					{
						"text": "10%",
						"callback_data": "nosho 4.2 "  +noshoId+" "  +sellerId+  " 10%"            
					},
					{
						"text": "15%",
						"callback_data": "nosho 4.2 "  +noshoId+" "  +sellerId+  " 15%" 
					}], 		
					[{
						"text": "20%",
						"callback_data": "nosho 4.2 "  +noshoId+" "  +sellerId+  " 20%"
					},
					{
						"text": "25%",
						"callback_data": "nosho 4.2 "  +noshoId+" "  +sellerId+ " 25%"
					},
					{
						"text": "50%",
						"callback_data": "nosho 4.2 "  +noshoId+" "  +sellerId+  " 50%"
					}]
					
				]
			}
		}	

		bot.telegram.sendMessage(sellerId, "Escolha um dos valores:" , opts)
	}
	else if (msg[1] == "4.1"){
		console.log(msg)
		sellerId = msg[3]
		noshoId = msg[2]
		
			bot.telegram.sendMessage(sellerId, "Tempo do NoSho no ar:" , {
					"reply_markup": {
						"inline_keyboard": [[
							{
								"text": "5min",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " 5"            
							}, 
							{
								"text": "15min",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+  " 15"            
							},
							{
								"text": "30min",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+  " 30" 
							}, 		
							{
								"text": "60min",
								"callback_data": "nosho 5 "  +noshoId+" "  +sellerId+ " 60"
							}]
						]
					}
				}			
			)
	}
	else if (msg[1] == "4.2"){
		
		console.log(msg)
		sellerId = msg[3]
		noshoId = msg[2]
		
		pool.connect()
			.then(client => {
				return client.query('UPDATE noshos set promo = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
					if (err) throw err;
					console.log('UPDATE noshos set promo = \''+ msg[4]+'\' where id = '+noshoId+';')
					client.release()		
		
				bot.telegram.sendMessage(sellerId, "Tempo do NoSho no ar:" , {
						"reply_markup": {
							"inline_keyboard": [[
								{
									"text": "5min",
									"callback_data": "nosho 6 "  +noshoId+" "  +sellerId+ " 5"            
								}, 
								{
									"text": "15min",
									"callback_data": "nosho 6 "  +noshoId+" "  +sellerId+  " 15"            
								},
								{
									"text": "30min",
									"callback_data": "nosho 6 "  +noshoId+" "  +sellerId+  " 30" 
								}, 		
								{
									"text": "60min",
									"callback_data": "nosho 6 "  +noshoId+" "  +sellerId+ " 60"
								}]
							]
						}
					}			
				)
			})})	
	}	
	else if (msg[1] == "5") {
			
			console.log("Enviar mensagem sem promo")
			console.log(msg)
			
			sellerId = msg[3]
			noshoId = msg[2]
			console.log(noshoId)
			
			let nome 
			let morada
			let people 
			let hora
			let minutos 
			let exterior 
			let promo 
			let destruct 
			
			pool.connect()
				.then(client => {
					return client.query('UPDATE noshos set destruct = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
						if (err) throw err;
						console.log('UPDATE noshos set destruct = \''+ msg[4]+'\' where id = '+noshoId+';')
						client.release()
						
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM noshos where id = '+noshoId+';', (err, res) => {
				if (err) throw err;
				console.log('SELECT * FROM noshos where id = '+noshoId+';')
				
					if (R.head(R.values(res.rows))) {
						console.log('entra no select')
						 nome = R.head(R.values(res.rows)).nome
						 morada = R.head(R.values(res.rows)).morada
						 people = R.head(R.values(res.rows)).pessoas
						 hora = R.head(R.values(res.rows)).horas
						 minutos = R.head(R.values(res.rows)).minutos
						 exterior = R.head(R.values(res.rows)).exterior
						 promo = R.head(R.values(res.rows)).promo
						 destruct = R.head(R.values(res.rows)).destruct
					}
					client.release();

		
					pool.connect()
						.then(client => {
							return client.query('SELECT * FROM users;', (err, res) => {
						if (err) throw err;
						console.log('entra no select users')
							for (let row of res.rows) {
								
							
								if (exterior == 'N') {
								if (row.idioma == 'en') {
				
							
									bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nTable for : "+people+ "\nTime : " + hora+":"+minutos, {parse_mode: 'HTML', reply_markup: {
										inline_keyboard: [
										[{text:"Book now ",callback_query:"blz",callback_data:noshoId}]
										]}
										})
										.then(function (result) {
						
											interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												
												console.log('Fazer udpdate no booked')
											},destruct*60000)
											
										});
									
								}
								else {
							
									bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa para : "+people+ "\nHora : "  + hora+":"+minutos,{parse_mode: 'HTML', reply_markup: {
										inline_keyboard: [
										[{text:"Reservar ",callback_query:"blz",callback_data:noshoId}]
										]}
										})
										.then(function (result) {
						
											interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												
												console.log('Fazer udpdate no booked')
											},destruct*60000)
										});
								}
								}
							else {
								if (row.idioma == 'en') {
				
							
									bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nOutdoor Table for : "+people+ "\nTime : " + hora+":"+minutos, {parse_mode: 'HTML', reply_markup: {
										inline_keyboard: [
										[{text:"Book now ",callback_query:"blz",callback_data:noshoId}]
										]}
										})
										.then(function (result) {
						
											interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												
												console.log('Fazer udpdate no booked')
											},destruct*60000)
										});
									
								}
								else {
							
									bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa exterior para : "+people+ "\nHora : "  + hora+":"+minutos,{parse_mode: 'HTML', reply_markup: {
										inline_keyboard: [
										[{text:"Reservar ",callback_query:"blz",callback_data:noshoId}]
										]}
										})
										.then(function (result) {
						
											interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												
												console.log('Fazer udpdate no booked')
											},destruct*60000)
										});
								}
							}	

							}
							client.release();
							console.log("enviar botao restaurante cancelar")
							bot.telegram.sendMessage( sellerId,"O seu NoSho para "+people+" ás "+hora+":"+minutos+" foi publicado com sucesso. Se desejar cancelar este NoSho prima o botão abaixo:", {reply_markup: {
								inline_keyboard: [
									[{text:"Cancelar ❌",callback_query:"blz",callback_data: "cancelar "+noshoId+ " "+ people + " " + hora+":"+minutos}]
								]}}).then(function (result) {
									console.log(result.message_id)
								pool.connect()
									.then(client => {
										return client.query('UPDATE noshos set msg_rest = ' + result.message_id+ ' where id = '+noshoId+';', (err, res) => {
									if (err) throw err;
									console.log('UPDATE noshos set msg_rest = ' + result.message_id+ ' where id = '+noshoId+';')
									client.release()
									})})
				})
				
				
				
						})	
					})
				})
					
			})})
					
		})		
	}
		
	else if (msg[1] == "6") {
	
			console.log("Enviar mensagem promo")
			console.log(msg)
			
			sellerId = msg[3]
			noshoId = msg[2]
			console.log(noshoId)
			
			let nome 
			let morada
			let people 
			let hora
			let minutos 
			let exterior 
			let promo 
			let destruct 
			
			pool.connect()
				.then(client => {
					return client.query('UPDATE noshos set destruct = \''+ msg[4]+'\' where id = '+noshoId+';', (err, res) => {
						if (err) throw err;
						console.log('UPDATE noshos set destruct = \''+ msg[4]+'\' where id = '+noshoId+';')
						client.release()
						
			pool.connect()
				.then(client => {
					return client.query('SELECT * FROM noshos where id = '+noshoId+';', (err, res) => {
				if (err) throw err;
				console.log('SELECT * FROM noshos where id = '+noshoId+';')
				
					if (R.head(R.values(res.rows))) {
						console.log('entra no select')
						 nome = R.head(R.values(res.rows)).nome
						 morada = R.head(R.values(res.rows)).morada
						 people = R.head(R.values(res.rows)).pessoas
						 hora = R.head(R.values(res.rows)).horas
						 minutos = R.head(R.values(res.rows)).minutos
						 exterior = R.head(R.values(res.rows)).exterior
						 promo = R.head(R.values(res.rows)).promo
						 destruct = R.head(R.values(res.rows)).destruct
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
									[{text:"Book now ",callback_query:"blz",callback_data: noshoId}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												
												console.log('Fazer udpdate no booked')
											},destruct*60000)
								});
							}
							else {
								
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa exterior para : "+people+ "\nHora : " + hora+":"+minutos+ "\nPromoção: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Reservar ",callback_query:"blz",callback_data: noshoId}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												console.log('Fazer udpdate no booked')
											},destruct*60000)
								});
							}
						}
						else {
							
							if (row.idioma == 'en') {
							
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nTable for : "+people+ "\nTime : " + hora+":"+minutos+ "\nPromo: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Book now ",callback_query:"blz",callback_data: noshoId}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												console.log('Fazer udpdate no booked')
											},destruct*60000)
								});
							}
							else {
								
								bot.telegram.sendMessage( row.chatid,"<b>NoSho !</b>\n"+nome+"\n"+morada+"\n\nMesa para : "+people+ "\nHora : " + hora+":"+minutos+ "\nPromoção: "+promo,{parse_mode: 'HTML', reply_markup: {
								inline_keyboard: [
									[{text:"Reservar ",callback_query:"blz",callback_data: noshoId}]
								]}
								})
								.then(function (result) {
							
									interval = setTimeout( () => {
												//bot.telegram.deleteMessage(row.chatid, result.message_id)
												pool.connect()
													.then(client => {
														return client.query('UPDATE noshos set booked = 1 where id = '+noshoId+';', (err, res) => {
															if (err) throw err;
															console.log('UPDATE noshos set booked = 1 where id = '+noshoId+';')
															client.release()												
												})})
												console.log('Fazer udpdate no booked')
											},destruct*60000)
								});
							}	
						}		
				}
				
				client.release();
					console.log("enviar botao restaurante cancelar")
					bot.telegram.sendMessage( sellerId,"O seu NoSho para "+people+" ás "+hora+":"+minutos+" foi publicado com sucesso. Se desejar cancelar este NoSho prima o botão abaixo:", {reply_markup: {
						inline_keyboard: [
							[{text:"Cancelar ❌",callback_query:"blz",callback_data: "cancelar "+noshoId+ " "+ people + " " + hora+":"+minutos}]
						]}}).then(function (result) {
							console.log(result.message_id)
						pool.connect()
							.then(client => {
								return client.query('UPDATE noshos set msg_rest = ' + result.message_id+ ' where id = '+noshoId+';', (err, res) => {
							if (err) throw err;
							console.log('UPDATE noshos set msg_rest = ' + result.message_id+ ' where id = '+noshoId+';')
							client.release()
							})})
				})
				})})
			})	
					
				})				
		})})
	}
	}
	else
	{
		
		try {
			ctx.deleteMessage()
		} catch (err) { console.log("")}

		const msg = ctx.update.callback_query.data.split(" ")
		const userId = ctx.update.callback_query.from.id
		const noshoId = msg[0]
		console.log("NOSHOID: " + noshoId)
		
		let sellerId
		let nomeRest 
		let moradaRest
		let pessoas 
		let horas
		let minutos 
		let exterior 
		let promo = '0'
		let destruct 
		let booked = -1
		let msg_Rest
		
		pool.connect()
				.then(client => {
					return client.query('SELECT * FROM noshos where id = '+noshoId+';', (err, res) => {
				if (err) throw err;
				console.log('SELECT * FROM noshos where id = '+noshoId+';')
				
					if (R.head(R.values(res.rows))) {
						 console.log('entra no select noshos')
						 sellerId = R.head(R.values(res.rows)).sellerid
						 nomeRest = R.head(R.values(res.rows)).nome
						 moradaRest = R.head(R.values(res.rows)).morada
						 pessoas = R.head(R.values(res.rows)).pessoas
						 horas = R.head(R.values(res.rows)).horas
						 minutos = R.head(R.values(res.rows)).minutos
						 exterior = R.head(R.values(res.rows)).exterior
						 promo = R.head(R.values(res.rows)).promo
						 destruct = R.head(R.values(res.rows)).destruct
						 booked = R.head(R.values(res.rows)).booked
						 msg_Rest = R.head(R.values(res.rows)).msg_rest
					}
					client.release();
		
		
		if (booked == 0) {
		
				
				pool.connect()
					.then(client => {
						return client.query('UPDATE noshos set booked=1, userid ='+userId+' where id = '+noshoId+';', (err, res) => {
					if (err) throw err;		
						client.release();
				})})
											
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
							
							
							const hora = horas+':'+minutos
							if (promo == '0'){
								if ( idioma == 'en') {
								
									//Mensagem para o user que reservou
									bot.telegram.sendMessage(userId,"Congratulations "+nome+" 👏🏼 you were the fastest of all members of the NoSho club to book \""+nomeRest+"\" for "+pessoas+" people at "+hora+ " !\n\nYour contact has been sent to the restaurant and they are awaiting your arrival. Please don’t be late 😎 ")
									.then(function (result) {				
										interval = setTimeout( () => {
													bot.telegram.deleteMessage(userId, result.message_id)
												},43200000)
												
										bot.telegram.sendLocation(userId, latitude, longitude)
										bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
										bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										console.log('msg_Rest ' +msg_Rest) 
										bot.telegram.deleteMessage(sellerId, msg_Rest)
									});
									
									
									
								}
								else {
									//Mensagem para o user que reservou
									bot.telegram.sendMessage(userId,"Parabéns "+nome+" 👏🏼 foi o mais rápido a ganhar este NoSho 👏🏼👏🏼 O restaurante \""+nomeRest+"\" para "+pessoas+" pessoas às "+hora+ " ficou reservado em seu nome e o seu contacto foi partilhado com o mesmo. Por favor não se atrase 😎 ")
									.then(function (result) {
											interval = setTimeout( () => {
														bot.telegram.deleteMessage(userId, result.message_id)
													},43200000)
													
											bot.telegram.sendLocation(userId, latitude, longitude)
											bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
										bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)	
										console.log('msg_Rest ' +msg_Rest)
										bot.telegram.deleteMessage(sellerId, msg_Rest)
										});
									
								}	
								}
								else {

									if ( idioma == 'en') {
									
										//Mensagem para o user que reservou
										bot.telegram.sendMessage(userId,"Congratulations "+nome+" 👏🏼 you were the fastest of all members of the NoSho club to book \""+nomeRest+"\" for "+pessoas+" people at "+hora+ " with a "+promo+ " discount on all food served (drinks not included). \n\nYour contact has been sent to the restaurant and they are awaiting your arrival. Please don’t be late 😎 ")
										.then(function (result) {
											interval = setTimeout( () => {
														bot.telegram.deleteMessage(userId, result.message_id)
													},43200000)
											bot.telegram.sendLocation(userId, latitude, longitude)
										bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
										bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
										bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)			
										console.log('msg_Rest ' +msg_Rest)
										bot.telegram.deleteMessage(sellerId, msg_Rest)
										});
										
									}
									else {
										//Mensagem para o user que reservou
										bot.telegram.sendMessage(userId,"Parabéns "+nome+" 👏🏼 foi o mais rápido a ganhar este NoSho 👏🏼👏🏼 O restaurante \""+nomeRest+"\" para "+pessoas+" pessoas às "+hora+ ", e com uma promoção de " +promo+" na carta (bebidas não incluidas), ficou reservado em seu nome e o seu contacto foi partilhado com o mesmo. Por favor não se atrase 😎 ")
										.then(function (result) {
											interval = setTimeout( () => {
														bot.telegram.deleteMessage(userId, result.message_id)
													},43200000)
											bot.telegram.sendLocation(userId, latitude, longitude)
											bot.telegram.sendMessage(774081606, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)
											bot.telegram.sendMessage(1158169804, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
											bot.telegram.sendMessage(1348824388, "🎉 O NoSho do restaurante "+nomeRest+ " para "+pessoas+" pessoas ás "+hora+" , foi ganho por: "+nome+" "+ultimoNome)		
											console.log('msg_Rest ' +msg_Rest)
											bot.telegram.deleteMessage(sellerId, msg_Rest)
										});
										
									}	
								}	
									//Mensagem para o restaurante
									ctx.telegram.sendMessage(sellerId,"A mesa foi reservada por:\n\nNome: "+nome+ " " +ultimoNome+ "\n\Número: " +telemovel+"\nMesa para: "+pessoas+"\nPromo: "+promo+"\n\nPor favor entre em contacto com o cliente para validar a reserva.")
									.then(function (result) {
										interval = setTimeout( () => {
													bot.telegram.deleteMessage(userId, result.message_id)
												},43200000)
									});
						
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
								bot.telegram.sendMessage(userId,"Oops 🤭 This NoSho is no longer available "+nome+"! But don't despair, more NoSho’s will come this way. Just keep a close eye and your fingers ready 😉")
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(userId, result.message_id)
											},43200000)
								});
							
							}
							else {
								//Mensagem para o user que reservou
								bot.telegram.sendMessage(userId,"Oops 🤭 Este NoSho já era "+nome+", mas não se preocupe que existirão mais oportunidades 😉")
								.then(function (result) {
				
									interval = setTimeout( () => {
												bot.telegram.deleteMessage(userId, result.message_id)
											},43200000)
								});
							}
						})
					})	
		}
		})})
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

bot.launch();