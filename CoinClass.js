class CoinClass
{
	constructor() {
		const mapData = {
			'tokenETH' : '0x886ca534fc8F734EA3f874A3c59D61acC2870105',
			'tokenBNB' : '0x315177E5Af3d357CA36382b78f745450B0966eC8',
			'proxiETH' : '0x97C3B5c801C6e0F8aaD64EA30e39E38D35919B56',
			'proxiBNB' : '0xc07d478B2375d52d97A03257f95a6aBDd6121dbA',
			'raise': '1,000,000',
			'limitGas' : '800000',
			'urlETH': 'https://rinkeby.infura.io/v3/3e32bc5961d04023b1734a4e97fb263c',
			'urlBNB': 'https://data-seed-prebsc-1-s1.binance.org:8545',
			'chainIdETH': 4,
			'chainIdBNB': 97,
			'dateStart': '',
			'dateEnd': '',
			'offeringStatus': 0,
			'language' : 'en',
			'isMetaMaskInstalled': false,
			'partClaimETH':[],
			'partClaimBNB':[],
			'timeClaimETH':[],
			'timeClaimBNB':[],
			'pending': 'Pending...',
			'claimed': 'Claimed'
		};
		this.MapData = mapData;
	}
	
	async initPage(){					
		const accountETH = this.formatAddress(this.MapData['tokenETH']);
		const accountBNB = this.formatAddress(this.MapData['tokenBNB']);
		$('.accountEth').text(accountETH);
		$('.accountBnb').text(accountBNB);
		
		$('#btn-copy-eth-buy').click(this.copyToClickBoardEth.bind(this));
		$('#btn-copy-eth-vesting').click(this.copyToClickBoardEth.bind(this));
		$('#btn-copy-bnb-buy').click(this.copyToClickBoardBnB.bind(this));
		$('#btn-copy-bnb-vesting').click(this.copyToClickBoardBnB.bind(this));
		$('#btn-card-ETH').click(this.showMainCard.bind(this,'ETH'));
		$('#btn-card-BNB').click(this.showMainCard.bind(this,'BNB'));
		
		await this.getOfferingavailableETH();
		await this.getOfferingavailableBNB();
		await this.checkConnection();	
		
		$('.btn-offering-eth').click(this.buyTokenEth.bind(this));
		$('.btn-offering-bnb').click(this.buyTokenBnb.bind(this));
		
		$('.btn-ves-eth-1').click(this.setClaimETH.bind(this,0));
		$('.btn-ves-eth-2').click(this.setClaimETH.bind(this,1));
		$('.btn-ves-eth-3').click(this.setClaimETH.bind(this,2));
		$('.btn-ves-eth-4').click(this.setClaimETH.bind(this,3));

		$('.btn-ves-bnb-1').click(this.setClaimBNB.bind(this,0));
		$('.btn-ves-bnb-2').click(this.setClaimBNB.bind(this,1));
		$('.btn-ves-bnb-3').click(this.setClaimBNB.bind(this,2));
		$('.btn-ves-bnb-4').click(this.setClaimBNB.bind(this,3));

		this.checkTime();			
		let x = setInterval(this.checkTime.bind(this), 1000); 
	}
	
	setClaimETH(index){
		const networkId = $('body').data('networkId');
		if(networkId !== this.MapData['chainIdETH']){
			const msn = 'Should connect to ETH network.';
			$.notify({ message: msn },{ type: 'danger'});
		}else{
			this.claimPartETH(index);
		}
	}
	setClaimBNB(index){
		const networkId = $('body').data('networkId');
		if(networkId !== this.MapData['chainIdBNB']){
			const msn = 'Should connect to BNB network.';
			$.notify({ message: msn },{ type: 'danger'});
		}else{
			this.claimPartBNB(index);
		}
	}

	isMetaMaskInstalled(){
		const { ethereum } = window;
		return Boolean(ethereum && ethereum.isMetaMask);
	};
	
	copyToClickBoardEth(){
		this.copyToClickBoard('.cardETH', '.contractETH', this.MapData['tokenETH']);
	}
	
	copyToClickBoardBnB(){
		this.copyToClickBoard('.cardBNB', '.contractBNB', this.MapData['tokenBNB']);
	}
	
	copyToClickBoard(card, label, content){
		navigator.clipboard.writeText(content)
		.then(() => {
			$(label).html("Copied Contract");
			$(card+" .card-footer").css("background-color", "#d1e7dd"); 
			this.officialContrat(card, label);
		})
		.catch(err => {
			$(label).html("Failed copy");
			$(card+" .card-footer").css("background-color", "#f8d7da"); 
			this.officialContrat(card, label);
		});
	}
	
	officialContrat(card, label){
		setTimeout(function(){
			$(label).html("Official Contract");
			$(card+" .card-footer").css("background-color", "rgba(0,0,0,.03)"); 
		}, 2000);
	}
	
	formatAddress(address){
		let resp = "";
		let length = address.length;
		resp = address.substring(0, 6)+ "..."+address.substring(length - 4, length);
		return resp;
	}
	
	checkTime(){
		this.checkOfferingOutTime();
		const timeStart = this.clockdownStart();
		const timeEnd = this.clockdownEnd();
		
		$('.dateIni').html(timeStart);
		
		if($(".availableETH").text() === '0 COIN'){
		   $('.timeETH').html('00h 00m 00s');
		}else{
		   $('.timeETH').html(timeEnd);
		}
		if($(".availableBNB").text() === '0 COIN'){
			$('.timeBNB').html('00h 00m 00s');
		}else{
			$('.timeBNB').html(timeEnd);
		}

		this.managementVestingETH();
		this.managementVestingBNB();
	}
				
	async getNetwork(){
		let networkIcon = "wrong-icon.png";
		let network = "Network";
		let networkId = 0;
		let chainId = await ethereum.request({ method: 'eth_chainId' });
		
		switch ( chainId ) { 
			case   "0x4"  : network = "Rinkeby"; networkIcon = "eth-icon.png"; break;
			case   "0x61" : network = "Testnet"; networkIcon = "bnb-icon.png"; break; // 97
			case   "0x1"  : network = "Ethereum"; networkIcon = "eth-icon.png"; break;
			case   "0x38" : network = "BNB"; networkIcon = "bnb-icon.png"; break; // 56
			default : chainId = "0x0";
		}
		$('body').data('networkId', parseInt(chainId,16));
		$(".viewNet").text(network);
		$("#networkIcon").attr("src", "/images/wallet/"+networkIcon);
	}
	
	round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}
	
	async getOfferingavailable(provider, coin, btnClass){				
		const proxiAddress = this.MapData['proxi'+coin];
		
		let	web3 = new Web3(provider);
		const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
		
		const obj = await proxi.methods.vista().call();					
		const amountOffering = parseFloat(obj.holderAmount);
		$('body').data("amountOffering"+coin, amountOffering);
		$(".amountOffer"+coin).text("("+amountOffering+" COIN)");
		
		const tokenValue = parseFloat(web3.utils.fromWei(obj.tValue));
		const price = this.round(tokenValue*amountOffering,4); 
		const available = parseFloat(web3.utils.fromWei(obj.available));
		const tokenSold = parseFloat(web3.utils.fromWei(obj.tokenSold));
		const rest = available - tokenSold;
		
		if(rest === 0){
			this.disableButton($(btnClass)[0]);
			$(".forClaim"+coin).text('0');
		}
		
		this.MapData['dateStart'] = (obj.start*1000); 
		this.MapData['dateEnd'] = (obj.end*1000);
		
		$(".available"+coin).text(rest+" COIN");
		$(".t-value"+coin).text(price.toString());

		const barra = (rest*100)/available;
		const raised = 100 - barra;
		const collect = Math.round((Number.EPSILON+parseFloat(raised)) * 100) / 100;
		
		$(".progress"+coin).width(barra+'%');
		$(".collect"+coin).text(collect+" %");
		$(".raise").html(this.MapData['raise']);
	}

	async checkOfferingOutTime(){
		const now = new Date().getTime();
		let flag = false;
		if(Number(this.MapData['dateStart']) >= now){
			this.soonButton($('.btn-offering-eth')[0]);
			this.soonButton($('.btn-offering-bnb')[0]);
			this.MapData['offeringStatus'] = 0;
			$('.lblStatus').html('Soon');
			flag = true;
		}
		
		if(Number(this.MapData['dateEnd']) <= now){
			const objBuyerEth = await this.getBuyersETH();
			if(Number(objBuyerEth.token_buyed)>0){
				this.claimButton($('.btn-offering-eth')[0]);
			}else{
				this.endedButton($('.btn-offering-eth')[0]);
			}
			const objBuyerBnb = await this.getBuyersBNB();
			if(Number(objBuyerBnb.token_buyed)>0){
				this.claimButton($('.btn-offering-bnb')[0]);
			}else{
				this.endedButton($('.btn-offering-bnb')[0]);
			}
			this.MapData['offeringStatus'] = 2;		
			$('.lblStatus').html('Ended');		
			flag = true;					
		}
		if(!flag && this.MapData['offeringStatus'] !== 1){
			this.MapData['offeringStatus'] = 1;
			this.getOfferingStatus();
			$('.lblStatus').html('Started');
		}
		return;
	}
	
	async getOfferingavailableETH(){				
		const provider = new Web3.providers.HttpProvider(this.MapData['urlETH']);
		await this.getOfferingavailable(provider, "ETH", '.btn-offering-eth');
	}
	
	async getOfferingavailableBNB(){
		const provider = this.MapData['urlBNB'];
		await this.getOfferingavailable(provider, "BNB", '.btn-offering-bnb');
	}

	async getBalance(provider, coin){
		let	web3 = new Web3(provider);
		let claimValue = '1';
		
		const proxiAddress = this.MapData['proxi'+coin];
		const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const buyer = await proxi.methods.buyers(currentAccount).call();
			if(buyer !== '0') claimValue = '0';
		}
		$('.forClaim'+coin).text(claimValue);
	}
	
	async getBalanceETH(){
		const provider = new Web3.providers.HttpProvider(this.MapData['urlETH']);
		await this.getBalance(provider, "ETH");
	}
	
	async getBalanceBNB(){
		const provider = this.MapData['urlBNB'];
		await this.getBalance(provider, "BNB");
	}
	
	async getAccounts(){
		let web3 = new Web3(window.ethereum);	
		await web3.eth.getAccounts(this.handleAccountsChangedWeb3.bind(this));
		await this.updateBalance();
		ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
		ethereum.on('chainChanged', this.handleChainChanged.bind(this));
	}
	
	handleAccountsChangedWeb3(err, accounts) {
		this.updateAccount(accounts);
	}
	
	handleAccountsChanged(accounts) {
		this.updateAccount(accounts);
		this.updateBalance();
	}
	
	updateAccount(accounts){
		let formatted = "Connect Wallet";
		
		let currentAccount = $('body').data('currentAccount');
		if (accounts.length === 0) {
			console.log('Please connect to MetaMask.');
			
			$('body').removeData('currentAccount');
			$('#btnConnectGlobal').addClass("pointer");
			$('#btnConnectGlobal').click(this.loginWithMetaMask.bind(this));
		} else if (accounts[0] !== currentAccount) {
			$('body').data('currentAccount', accounts[0]);
			formatted = this.formatAddress(accounts[0]);
			$('#btnConnectGlobal').removeClass("pointer");
			$('#btnConnectGlobal').unbind('click');
		}
		$('.viewAccount').text(formatted);
	}
	

	async updateBalance(){
		await this.getBalanceETH();
		await this.getBalanceBNB();
		this.getOfferingStatus();
	}
	
	handleChainChanged(chain) {
		this.getNetwork();
	}
	
	async buyToken(provider, coin, btnClass, chainId,buyers){
		const networkId = $('body').data('networkId');
		const currentAccount = $('body').data('currentAccount');
		
		if(!currentAccount){
			this.loginWithMetaMask();
		}else if(networkId != chainId){
			const msn = 'Should connect to '+coin+' network.';
			$.notify({ message: msn },{ type: 'danger'});
		}else if(Number(buyers.token_buyed)==0){
			this.pendingButton($(btnClass)[0]);
			try{
				const proxiAddress = this.MapData['proxi'+coin];
				let web3 =  new Web3(window.ethereum);
				
				const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
				
				const obj = await proxi.methods.vista().call();	
				const tokenValue = parseFloat(web3.utils.fromWei(obj.tValue));
				const amountOffering = $('body').data('amountOffering'+coin);
				const amount = tokenValue * amountOffering;
				const amountWei = web3.utils.toWei(String(amount));
				const limitGas = this.MapData['limitGas'];
				
				const currentAccount = $('body').data('currentAccount');
				if(currentAccount){
					const data = {from:currentAccount, gas:limitGas, value:amountWei};
					
					//const info = await this.showRevertMessage(proxi, data);
					const info = {"status":1};
					if(info.status === 1){
						this.pendingButton($(btnClass)[0]);// new call pending
						await proxi.methods.buyerToken().send(data);
						await this.getOfferingavailable(provider, coin, btnClass);
						await this.getBalance(provider, coin);
						this.getOfferingStatus();
					}else{
						this.enableButton($(btnClass)[0]);
						$('.forClaim'+coin).text('1');
					}
				}else{
					console.log('Please connect to MetaMask.');
				}
			}catch(e){
				if(e.receipt && e.receipt.transactionHash){
					const transactionHash = e.receipt.transactionHash;
					console.log('TransactionHash: '+transactionHash);
				}
				this.enableButton($(btnClass)[0]);
				$('.forClaim'+coin).text('1');
			}
		}else if(Number(buyers.token_buyed)>0){
			$('.vest-'+coin+'-card').removeClass('d-none');
			$('.offer-'+coin+'-card').addClass('d-none');
		}
	}
	
	showMainCard(coin){
		$('.vest-'+coin+'-card').addClass('d-none');
		$('.offer-'+coin+'-card').removeClass('d-none');
	}
	
	async showRevertMessage(proxi, data){
		try{
			await proxi.methods.buyerToken().call(data);
			return { status: 1, message: 'Success'};
		}catch(e){
			const msg = e.message.split('\n')[0];
			console.log(msg);
			$.notify({ message: msg },{ type: 'danger'});
			return { status: 0, message: msg};
		}
	}
	
	async buyTokenEth(){
		const provider = new Web3.providers.HttpProvider(this.MapData['urlETH']);
		const buyers = await this.getBuyersETH();
		this.buyToken(provider, 'ETH', '.btn-offering-eth', this.MapData['chainIdETH'],buyers);
	}
	
	async buyTokenBnb(){
		const provider = this.MapData['urlBNB'];
		const buyers = await this.getBuyersBNB();
		this.buyToken(provider, 'BNB', '.btn-offering-bnb', this.MapData['chainIdBNB'],buyers);
	}
	
	disableButton(btn,text){
		if(text === undefined){
			text = "Ended";
		}
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = text;
		btn.disabled = true;
	}

	installButton(btn){
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = "Install MetaMask";
		btn.disabled = true;
	}
	
	soonButton(btn){
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = "Soon"
		btn.disabled = true;
	}

	endedButton(btn){
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = "Ended";
		btn.disabled = true;
	}
	pendingButton(btn){
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = this.MapData['pending']
		btn.disabled = true;
	}
	
	claimedButton(btn){
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = this.MapData['claimed']
		btn.disabled = true;
	}

	claimButton(btn){
		btn.classList.add('btn-wuao');
		btn.classList.remove('btn-secondary');
		btn.innerHTML = "Claim"
		btn.disabled = false;
	}

	claimQuaterButton(btn){
		btn.classList.add('btn-wuao');
		btn.classList.remove('btn-secondary');
		btn.innerHTML = "Claim (250 token)"
		btn.disabled = false;
	}
	
	enableButton(btn){
		btn.classList.add('btn-wuao');
		btn.classList.remove('btn-secondary');
		btn.innerHTML = "Buy now";
		btn.disabled = false;
	}	
	
	connectButton(btn){
		btn.classList.remove('btn-wuao');
		btn.classList.add('btn-secondary');
		btn.innerHTML = "Connect Metamask";
		btn.disabled = false;
	}
	
	async checkConnection(){
		const flag = this.isMetaMaskInstalled(); 
		if(flag){
			await this.getNetwork();
			await this.getAccounts();
		}else{
			const btnOfferingETH = $('.btn-offering-eth')[0];
			const btnOfferingBNB = $('.btn-offering-bnb')[0];
			this.installButton(btnOfferingETH);
			this.installButton(btnOfferingBNB);
			$('.viewAccount').text("Install Metamask");
			$('.forClaim').html('1');
		}
		this.MapData['isMetaMaskInstalled'] = flag;
	}

	async getProxiETH(){
		const provider = new Web3.providers.HttpProvider(this.MapData['urlETH']);
		const proxiAddress = this.MapData['proxiETH'];
		let	web3 = new Web3(provider);
		const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
		return proxi;
	}

	async getProxiMetamaskETH(){
		let web3 =  new Web3(window.ethereum);
		const proxiAddress = this.MapData['proxiETH'];
		const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
		return proxi;
	}

	async getProxiMetamaskBNB(){
		let web3 =  new Web3(window.ethereum);
		const proxiAddress = this.MapData['proxiBNB'];
		const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
		return proxi;
	}
	

	async getProxiBNB(){
		const provider = this.MapData['urlBNB'];
		const proxiAddress = this.MapData['proxiBNB'];
		let	web3 = new Web3(provider);
		const proxi = new web3.eth.Contract(VESTING.abi, proxiAddress);
		return proxi;
	}

	async getBuyersETH(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiETH();
			const buyer = await proxi.methods.buyers(currentAccount).call();
			if(buyer.token_buyed>0 ){
				if(this.MapData['timeClaimETH'].length==0){
					this.MapData['timeClaimETH'] = await this.getTimeClaimETH();
					this.MapData['timeClaimETH'] = this.MapData['timeClaimETH'].map((val)=>{return val*1000});
				}
				this.MapData['partClaimETH'] = await this.getPartClaimETH();
				console.log(this.MapData['partClaimETH']);
			}
			return buyer;
		}else{
			return;
		}
	}

	async getTimeClaimETH(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiETH();
			const times = await proxi.methods.getTimeForClaim(currentAccount).call();
			return times;
		}else{
			return;
		}
	}

	async claimETH(part){
		const currentAccount = $('body').data('currentAccount');
		const limitGas = this.MapData['limitGas'];
		if(currentAccount){
			const proxi = await this.getProxiMetamaskETH();
			this.pendingButton($('.btn-ves-eth-'+(parseInt(part)+1))[0]);//call pending
			try{
				await proxi.methods.claim(part).send({from:currentAccount,gas:limitGas});
			}catch(err){
				this.claimQuaterButton($('.btn-ves-eth-'+(parseInt(part)+1))[0]);//call new state
			}
			//this.pendingButton($('.btn-ves-eth-'+(parseInt(part)+1))[0]);
		}
	}

	async claimBNB(part){
		const currentAccount = $('body').data('currentAccount');
		const limitGas = this.MapData['limitGas'];
		if(currentAccount){
			const proxi = await this.getProxiMetamaskBNB();
			this.pendingButton($('.btn-ves-bnb-'+(parseInt(part)+1))[0]);//call pending
			try{
				await proxi.methods.claim(part).send({from:currentAccount,gas:limitGas});
			}catch(err){
				this.claimQuaterButton($('.btn-ves-bnb-'+(parseInt(part)+1))[0]);//call new state
			}
		}
	}

	async getPartClaimETH(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiETH();
			const part = await proxi.methods.getPart(currentAccount).call();
			return part;
		}else{
			return;
		}
	}

	async getBuyersBNB(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiBNB();
			const buyer = await proxi.methods.buyers(currentAccount).call();
			if(buyer.token_buyed>0 && this.MapData['timeClaimBNB'].length==0){
				this.MapData['timeClaimBNB'] = await this.getTimeClaimBNB();
				console.log(this.MapData['timeClaimBNB']);
				this.MapData['timeClaimBNB'] = this.MapData['timeClaimBNB'].map((val)=>{return val*1000});
			}
			this.MapData['partClaimBNB'] = await this.getPartClaimBNB();
			return buyer;
		}else{
			return;
		}
	}

	async getBuyersETH(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiETH();
			const buyer = await proxi.methods.buyers(currentAccount).call();
			if(buyer.token_buyed>0 ){
				if(this.MapData['timeClaimETH'].length==0){
					this.MapData['timeClaimETH'] = await this.getTimeClaimETH();
					this.MapData['timeClaimETH'] = this.MapData['timeClaimETH'].map((val)=>{return val*1000});
				}
				this.MapData['partClaimETH'] = await this.getPartClaimETH();
			}
			return buyer;
		}else{
			return;
		}
	}

	async getTimeClaimBNB(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiBNB();
			const times = await proxi.methods.getTimeForClaim(currentAccount).call();
			return times;
		}else{
			return;
		}
	}

	async getPartClaimBNB(){
		const currentAccount = $('body').data('currentAccount');
		if(currentAccount){
			const proxi = await this.getProxiBNB();
			const part = await proxi.methods.getPart(currentAccount).call();
			return part;
		}else{
			return;
		}
	}

	async getOfferingStatus(){
		const btnOfferingETH = $('.btn-offering-eth')[0];
		const btnOfferingBNB = $('.btn-offering-bnb')[0];
		const currentAccount = $('body').data('currentAccount');

		if(this.MapData['isMetaMaskInstalled']){
			if(this.MapData['offeringStatus'] === 1){
				if(currentAccount){
					this.setTokenStatus(await this.getBuyersETH(),btnOfferingETH, ".forClaimETH", ".availableETH");
					this.setTokenStatus(await this.getBuyersBNB(),btnOfferingBNB, ".forClaimBNB", ".availableBNB");
				}else{
					this.connectButton(btnOfferingETH);
					this.connectButton(btnOfferingBNB);
				}
			}
		}else{
			this.installButton(btnOfferingETH);
			this.installButton(btnOfferingBNB);
		}
		
	};
	
	setTokenStatus(buyers, btnOffering, maxMint, availableToken){
		if(Number(buyers.token_buyed) > 0){
			$(maxMint).text('0');
			this.claimButton(btnOffering);
		}else if(this.MapData['offeringStatus'] !== 1){
			$(maxMint).text('0');
			return;
		}else if($(availableToken).text() === '0 COIN'){
			$(maxMint).text('0');
			this.disableButton(btnOffering);
		}else{
			$(maxMint).text('1');
			this.enableButton(btnOffering);
		}
	}
	
	async loginWithMetaMask(){
		ethereum.request({ method: 'eth_requestAccounts' })
	}

	clockdownStartVesting(ts){
		const distanceStartObj = this.getDistanceStartVesting(ts);
		const dateStart = distanceStartObj.dateStart;
		const distanceStart = distanceStartObj.distanceStart;
		let time;
		
		if( distanceStart > 86400000 || distanceStart < 0){ // One day
			const lan = this.MapData['language'];
			const month = dateStart.getUTCMonth();
			const monthText = lan === 'es' ? this.getMonthES(month) : this.getMonthEN(month);
			time = monthText + " " + dateStart.getUTCDate();
		}else {
			time = this.getTimeInfo(distanceStart);
		}								
		return time;
	}

	getDistanceStartVesting(ts){
		const dateStart = new Date(ts);
		const dateLocal = new Date();
		
		const countDownStart = dateStart.getTime();
		const now = dateLocal.getTime();
		const distanceStart = countDownStart - now;
		return {'dateStart': dateStart,'distanceStart': distanceStart};
	}

	async managementVestingETH(){
		const timeC = this.MapData['timeClaimETH'];
		this.MapData['partClaimETH'] = await this.getPartClaimETH();
		const partC = this.MapData['partClaimETH'];

		this.setTimerStartClaim(timeC,'eth');
		const obj = this.getdistancePart(timeC);
		if(obj.distPart1 < 1){
			const btn = $('.btn-ves-eth-1')[0];
			if(Number(partC[0])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
		if(obj.distPart2 < 1){
			const btn = $('.btn-ves-eth-2')[0];
			if(Number(partC[1])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
		if(obj.distPart3 < 1){
			const btn = $('.btn-ves-eth-3')[0];
			if(Number(partC[2])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
		if(obj.distPart4 < 1){
			const btn = $('.btn-ves-eth-4')[0];
			if(Number(partC[3])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
	}

	async managementVestingBNB(){
		const timeC = this.MapData['timeClaimBNB'];
		this.MapData['partClaimBNB'] = await this.getPartClaimBNB();
		const partC = this.MapData['partClaimBNB'];
		this.setTimerStartClaim(timeC,'bnb');
		const obj = this.getdistancePart(timeC);
		if(obj.distPart1 < 1){
			const btn = $('.btn-ves-bnb-1')[0];
			if(Number(partC[0])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
		if(obj.distPart2 < 1){
			const btn = $('.btn-ves-bnb-2')[0];
			if(Number(partC[1])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
		if(obj.distPart3 < 1){
			const btn = $('.btn-ves-bnb-3')[0];
			if(Number(partC[2])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
		if(obj.distPart4 < 1){
			const btn = $('.btn-ves-bnb-4')[0];
			if(Number(partC[3])==0){
				this.claimedButton(btn);
			}else{
				if(btn.innerText!=this.MapData['pending']&&btn.innerText!=this.MapData['claimed']){
					btn.classList.add('btn-wuao');
					btn.classList.remove('btn-secondary');
					btn.disabled = false;
				}
			}
		}
	}

	setTimerStartClaim(timeC,network){
		$('.timePart1-'+network).html(this.clockdownStartVesting(Number(timeC[0])));
		$('.timePart2-'+network).html(this.clockdownStartVesting(Number(timeC[1])));
		$('.timePart3-'+network).html(this.clockdownStartVesting(Number(timeC[2])));
		$('.timePart4-'+network).html(this.clockdownStartVesting(Number(timeC[3])));
	}

	getdistancePart(timeC){
		const distPart1 = Number(this.getDistanceStartVesting(Number(timeC[0])).distanceStart);
		const distPart2 = Number(this.getDistanceStartVesting(Number(timeC[1])).distanceStart);
		const distPart3 = Number(this.getDistanceStartVesting(Number(timeC[2])).distanceStart);
		const distPart4 = Number(this.getDistanceStartVesting(Number(timeC[3])).distanceStart);
		return {'distPart1':distPart1,'distPart2':distPart2,'distPart3':distPart3,'distPart4':distPart4};
	}

	claimPartETH(part){
		const partC = this.MapData['partClaimETH'];
		if(partC!=undefined && partC.length>0){
			if(partC[part]> 0){
				this.claimETH(part);
			}else{
				$.notify({ message: 'it was Claimed before...'},{ type: 'danger'});
			}				
		}
	}

	claimPartBNB(part){
		const partC = this.MapData['partClaimBNB'];
		if(partC!=undefined && partC.length>0){
			if(partC[part]> 0){
				this.claimBNB(part);
			}else{
				$.notify({ message: 'it was Claimed before...'},{ type: 'danger'});
			}				
		}
	}

	clockdownStart(){
		const dateStart = new Date(Number(this.MapData['dateStart']));
		const dateLocal = new Date();
		
		const countDownStart = dateStart.getTime();
		const now = dateLocal.getTime();
		const distanceStart = countDownStart - now;				
		let time;
		
		if( distanceStart > 86400000 || distanceStart < 0){ // One day
			const lan = this.MapData['language'];
			const month = dateStart.getUTCMonth();
			const monthText = lan === 'es' ? this.getMonthES(month) : this.getMonthEN(month);
			time = monthText + " " + dateStart.getUTCDate();
		}else {
			time = this.getTimeInfo(distanceStart);
		}								
		return time;
	}
	
	clockdownEnd(){
		const dateStart = new Date(Number(this.MapData['dateStart']));
		const dateEnd = new Date(Number(this.MapData['dateEnd']));
		const dateLocal = new Date();
		
		const countDownStart = dateStart.getTime();
		const countDownEnd = dateEnd.getTime();
		const now = dateLocal.getTime();
		const distanceTotal = countDownEnd - countDownStart;
		const distanceEnd = countDownEnd - now;
		
		let time;
		
		if(this.MapData['offeringStatus'] === 0){
			time = this.getTimeInfo(distanceTotal);
		}else if (distanceEnd < 0) {
			time = "00h 00m 00s";
		}else {
			time = this.getTimeInfo(distanceEnd);
		}								
		return time;
	}
	
	getTimeInfo(distance){
		let time;
		if( distance > 86400000){ // One day
			let days = Math.floor(distance / (1000 * 60 * 60 * 24));
			time = days+" days";
		}else{
			let hours = Math.floor(distance / (1000 * 60 * 60));
			let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			let seconds = Math.floor((distance % (1000 * 60)) / 1000);
			
			if(hours < 10) hours = "0"+hours;
			if(minutes < 10) minutes = "0"+minutes;
			if(seconds < 10) seconds = "0"+seconds;
			time = hours + "h " + minutes + "m " + seconds+"s";
		}
		return time;
	}
	
	getMonthES(month){
		switch(month){
			case 1: return 'Febrero';
			case 2: return 'Marzo';
			case 3: return 'Abril';
			case 4: return 'Mayo';
			case 5: return 'Junio';
			case 6: return 'Julio';
			case 7: return 'Agosto';
			case 8: return 'Septiembre';
			case 9: return 'Octubre';
			case 10: return 'Noviembre';
			case 11: return 'Diciembre';
			default: return 'Enero';
		}
	}
	
	getMonthEN(month){
		switch(month){
			case 1: return 'February';
			case 2: return 'March';
			case 3: return 'April';
			case 4: return 'May';
			case 5: return 'June';
			case 6: return 'July';
			case 7: return 'August';
			case 8: return 'September';
			case 9: return 'October';
			case 10: return 'November';
			case 11: return 'December';
			default: return 'January';
		}
	}

}
		
document.addEventListener("DOMContentLoaded", function(event) {
	let ICoinClass = new CoinClass();
	ICoinClass.initPage();
});