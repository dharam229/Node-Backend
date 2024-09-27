const app = require("./app");
const { Server } = require("socket.io");
const http = require("http");
const port = process.env.PORT;
const routes = require('./routes/index');
const models = require('./models');
const Chat = models.Chat;
const ChatMessage = models.ChatMessage;
const jwt = require("jsonwebtoken");
const Fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({ accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY })

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: `http://localhost:3000` }, maxHttpBufferSize: 5e6 });
io.use(async (socket, next) => {
	const token = socket.handshake.auth.token;
	try {
		// verify jwt token and get user data
		const user = await jwt.verify(token, process.env.TOKEN_KEY);
		// save the user data into socket object, to be used further
		socket.user = user;
		next();
	} catch (e) {
		// if token is invalid, close connection
		console.log('error', e.message);
		return next(new Error(e.message));
	}
}).on("connection", (socket) => {
	//console.log(`User Connected: ${socket.id}`);

	socket.on("create_group", async (data) => {
		let chat = await Chat.findOne({ chat_type: 2, name: data.group_name, created_by: socket.user.user_id }).exec();
		if (!chat) {
			let chat = new Chat({ name: data.group_name, users: [socket.user.user_id], chat_type: 2, status: 1, created_by: socket.user.user_id, updated_by: socket.user.user_id })
			return await chat.save()
				.then(function (result, error) {
					if (result) {
						socket.join(result._id.toString());
						socket.emit('group_success', { msg: 'Group created successfully', data: result });
					} else {
						socket.emit('erro_occured', error.msg);
					}
				})
				.catch(error => { socket.emit('erro_occured', error.msg); });
		} else {
			socket.emit('erro_occured', 'You already have a group with this name, please use another name.');
		}
	})

	socket.on("join_group_chat", async (data) => {
		let chat = await Chat.findOne({ _id : data.chatId }).exec();
		if(!chat.users.includes(socket.user.user_id)){
			await Chat.findByIdAndUpdate(data.chatId, { $push: { users: socket.user.user_id } } );
			socket.emit('join_chat_callback', { type: 'success', chat_id: data.chatId, messages: {} });
		}else{
			socket.join(data.chatId);
			let chat_message = await ChatMessage.find({ chat_id: data.chatId }).populate('sender').exec();
			socket.emit('join_chat_callback', { type: 'success', chat_id: data.chatId, messages: chat_message });
		}
	});

	socket.on("join_chat", async (data) => {
		const decoded = socket.user;
		let chat = await Chat.findOne({ chat_type: 1, users: { $all: [data.user, decoded.user_id] } }).exec();
		//console.log('user_selected chat', chat)
		if(!chat){
			//create new chat and return chat ID and empty message object
			let chat = new Chat({name: '', users: [data.user, decoded.user_id], chat_type: 1, status: 1, created_by: decoded.user_id, updated_by: decoded.user_id})
			return await chat.save()
				.then(function (result, error) {
					if (result) {
						socket.join(result._id.toString());
						socket.emit('join_chat_callback', { type: 'success', chat_id: result._id, messages: {} });
					} else {
						socket.emit('erro_occured', error.msg);
					}
				})
				.catch(error =>  {socket.emit('erro_occured', error.msg);});
		
		}else{
			socket.join(chat._id.toString());
			let chat_message = await ChatMessage.find({ chat_id: chat._id }).populate('sender').exec();
			socket.emit('join_chat_callback', { type: 'success', chat_id: chat._id, messages: chat_message });
		}
	});
 
	
	socket.on("send_message", async (data, callback) => {
		//console.log('send message data', data)
		//console.log('send message data', data.file_data.length)
		const decoded = socket.user;
		const message = await ChatMessage.create({ chat_id: data.chatid, sender: decoded.user_id, message: data.message, created_by: decoded.user_id, updated_by: decoded.user_id });
	
		if(data.file_data.name !== undefined && data.file_data.type !== undefined){	
			//console.log('comming to has file condition')
			//After saving message save file
			const ext = data.file_data.type.split("/")[1];
            const fileName = Date.now() + '.' + ext;
			//let fileName = file.originalname.replace(/\s/g, "");
			const FOLDER_PATH = 'chat/' + data.chatid;
			const PRODUCT_UPLOAD_PATH = FOLDER_PATH + '/' + fileName;
			let params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: PRODUCT_UPLOAD_PATH, Body: data.file_data.buffer, ContentType: data.file_data.type };
			let uploadPromise = await S3.upload(params).promise();
			message.files = JSON.stringify({ bucket_name : process.env.AWS_S3_BUCKET_NAME, real_name: data.file_data.name, name: fileName, path: uploadPromise.Key, mime: data.file_data.type });
			await message.save();
			//return the call back
			callback(message);
			//Emit the event after file saved message recived
			socket.to(data.chatid).emit("message_recived", message);
			
		}else{
			//return the call back
			callback(message);
			//console.log('comming to not has file condition')
			socket.to(data.chatid).emit("message_recived", message);
		}	
	});
  
	socket.on("disconnect", () => {
		console.log("User Disconnected", socket.id);
	});

	
});

// server listening 
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

app.use('/', routes);
