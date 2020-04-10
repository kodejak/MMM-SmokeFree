/* global Module */

/* Magic Mirror
 * Module: MMM-SmokeFree
 *
 * By Christian Handorf
 * MIT Licensed.
 */

"use strict";

Module.register("MMM-SmokeFree", {

	output: "calculating...",
	days: 0,
	packs: 0,
	cigs: 0,
	money: 0,
	startDate: 0,
	endDate: 0,
	duration: 0,

	defaults: {
		header: "Smoke Free",
		updateInterval: 5*1000,
		startDateTime: "1970-01-01 01:00",
		cigsPerDay: 20,
		cigsPerPack: 19,
		pricePerPack: 6,
		cigPrependString: "",
		cigAppendString: " Zigaretten nicht geraucht",
		packPrependString: "",
		packAppendString: " Schachteln nicht geraucht",
		moneyPrependString: "Insgesamt ",
		moneyAppendString: " &euro; gespart",
		daysPrependString: "",
		daysAppendString: " Tage durchgehalten",
		summaryTimePrependString: "Seit ",
		summaryTimeAppendString: " nicht geraucht",
		summaryTimeLocales: ["Jahr","Monat","Tag","Stunde","Minute"],
		summaryTimeLocalesPlural: ["Jahren","Monaten","Tagen","Stunden","Minuten"],
		showPacks: true,
		showSummaryTime: true,
		showSymbols: true,
		textAlign: "align-left"
	},

	getScripts: function() {
        	return ["moment.js"];
	},

	getStyles: function() {
                return ["font-awesome.css","script.css"];
        },

	start: function() {
		this.calcValues();
		this.scheduleUpdate();
	},

	getDom: function() {
		var wrapper = document.createElement("div");
        	wrapper.className = "wrapper";
        	wrapper.style.maxWidth = this.config.maxWidth;

		this.output = "";
		if (this.config.showSymbols) {
			this.output = '<i class="far fa-calendar-check smokelist"></i>';
		}
		this.output += this.config.daysPrependString + Math.floor(this.days) + this.config.daysAppendString + "<br>";
		if (this.config.showSymbols) {
			this.output += '<i class="fas fa-smoking smokelist"></i>';
		}
		this.output += this.config.cigPrependString + Math.ceil(this.cigs) + this.config.cigAppendString + "<br>";
		if (this.config.showPacks) {
			if (this.config.showSymbols) {
                        	this.output += '<i class="fas fa-smoking smokelist"></i>';
                	}
			this.output += this.config.packPrependString + Math.ceil(this.packs) + this.config.packAppendString + "<br>";
		}
		if (this.config.showSymbols) {
                        this.output += '<i class="far fa-money-bill-alt smokelist"></i>';
                }
		this.output += this.config.moneyPrependString + parseFloat(this.money).toFixed(2) + this.config.moneyAppendString + "<br>";

		if (this.config.showSummaryTime) {
			const times = ["years", "months", "days", "hours", "minutes"]; 
      			var summary = "";

      			for (var i = 0; i < times.length; i++) {
				var t = parseInt(this.duration.get(times[i]));

				if (t > 0) {
					if (summary.length > 0) {
						summary += " ";
          				}
          				var name = (t > 1) ? this.config.summaryTimeLocalesPlural[i] : this.config.summaryTimeLocales[i];
					summary += t + " " + name;
        			}
      			}
			this.output += this.config.summaryTimePrependString + summary + this.config.summaryTimeAppendString;
		}

		var content = document.createElement("div");
		content.classList.add("small", "bright", this.config.textAlign);
		content.innerHTML = this.output;

		wrapper.appendChild(content);
		return wrapper;
	},

	calcValues: function () {
		this.startDate = moment(this.config.startDateTime).local();
		this.endDate = moment().local();
		if (this.startDate.isDST() != this.endDate.isDST()) {
			if (this.startDate.isDST()) {
				this.startDate.add(1, "hours").format("Z");
			} else {
				this.startDate.subtract(1, "hours").format("Z");
			}
		}
		this.duration = moment.duration(this.endDate.diff(this.startDate));
		this.days = moment(this.endDate).diff(this.startDate, 'days', true);
		//this.days = Math.abs(moment.duration(moment(this.startDate).diff(this.endDate)).asDays());
		this.cigs = this.days * this.config.cigsPerDay;
		this.packs = this.cigs / this.config.cigsPerPack;
		this.money = this.config.pricePerPack * this.packs;
	},

	scheduleUpdate: function() {
		setInterval(() => {
			this.calcValues();
			this.updateDom();
		}, this.config.updateInterval);
	},

});
