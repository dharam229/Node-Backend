const Moment = require("moment");

const helpers = {
	diffYMDHMS: function(date1) {
		date1 = Moment(date1);
		let date2 = Moment();
		let years = date1.diff(date2, 'year');
		date2.add(years, 'years');
		let months = date1.diff(date2, 'months');
		date2.add(months, 'months');
		let days = date1.diff(date2, 'days');
		date2.add(days, 'days');
		let hours = date1.diff(date2, 'hours');
		date2.add(hours, 'hours');
		let minutes = date1.diff(date2, 'minutes');
		date2.add(minutes, 'minutes');
		//let seconds = date1.diff(date2, 'seconds');
		if(days > 0 || hours > 0 || minutes > 0){
			var new_string = '';
			new_string += days > 0 ? days + 'd,' : '';
			new_string += hours > 0 ? hours + 'h,' : '';
			new_string += minutes > 0 ? minutes + 'm' : '';
			return new_string;
		}else{
			return '';
		}
	},
	
	getParsedDate: function(date){
		date = String(date).split(' ');
		var days = String(date[0]).split('-');
		var hours = String(date[1]).split(':');
		return [parseInt(days[0]), parseInt(days[1])-1, parseInt(days[2]), parseInt(hours[0]), parseInt(hours[1]), parseInt(hours[2])];
	},
	
	randomString: function (len) {
		var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		return [...Array(len)].reduce(a=>a+p[~~(Math.random()*p.length)],'');
	}
}

module.exports = helpers;