var acikPencereler = {};
var restartRequest = false;
var kayitlar = {
	okul_adi: 'POLATLI TİCARET MESLEK LİSESİ',
	duyuru: 'LCD Pano © 2013',
	scrolldelay: '80',
	scrollamount: '30',
	haber_kat : 'mansetler-m',
	nob_per_punto: '20',
	adres: 'Polatli, Turkey',
	apikey: '',
	slayt_hizi: '5',
	ogretim_turu: 'tamgn',
	nobet_degisim_saati: '13:00',
	nobet_kategorileri: 'MÜDÜR YRD.,BAHÇE,ZEMİN KAT,1.KAT,2.KAT,3.KAT'
}

function panoPenceresi() {
	chrome.app.window.create('pano.html', {
		width: 1200, height: 675,
		minWidth: 1200, minHeight: 675,
		id: 'pano', frame: 'none'
	}, function (w) {
		acikPencereler.pano = w;
		w.onClosed.addListener(function() {
			chrome.alarms.clearAll();
			delete acikPencereler.pano;
			if(restartRequest) {
				panoPenceresi();
				restartRequest = false;
			}
		});
	});
}

function ayarlarPenceresi() {
	chrome.app.window.create('ayarlar.html', {
		width: 1000, height: 550,
		minWidth: 1000, minHeight: 550,
		maxWidth: 1000, minWidth: 550,
		id: 'ayarlar'
	}, function (w) {
		acikPencereler.ayarlar = w;
		w.onClosed.addListener(function() {
			delete acikPencereler.ayarlar;
		});
	});
}

chrome.runtime.onInstalled.addListener(function(evt) {
	if(evt.reason == "install") {
		chrome.storage.local.set(kayitlar, function () {
			panoPenceresi();
		});
	}
});

chrome.app.runtime.onLaunched.addListener(function() {

	chrome.alarms.clearAll();

	panoPenceresi();

	chrome.contextMenus.removeAll(function() {
		chrome.contextMenus.create({ title: 'Tam Ekran', id: 'menuTamEkran', contexts: ['all'] , type: 'checkbox' });
		chrome.contextMenus.create({ title: 'Ayraç', id: 'menuAyrac', contexts: ['all'], type: 'separator' });
		chrome.contextMenus.create({ title: 'Ayarlar', id: 'menuAyarlar', contexts: ['all'] });
		chrome.contextMenus.create({ title: 'Küçült', id: 'menuKucult', contexts: ['all'] });
		chrome.contextMenus.create({ title: 'Çıkış', id: 'menuCikis', contexts: ['all'] });
	});

	chrome.contextMenus.onClicked.addListener(function(item) {
		switch (item.menuItemId) {
			case 'menuAyarlar':
			ayarlarPenceresi();
			break;
			case 'menuKucult':
			for (var i in acikPencereler) {
				acikPencereler[i].minimize();
			}
			break;
			case 'menuTamEkran':
			acikPencereler.pano.contentWindow.tamEkranToggle();
			break;
			case 'menuCikis':
			
			for (var i in acikPencereler) {
				acikPencereler[i].close();
			}
			break;
		}
	});
});

chrome.runtime.onMessage.addListener(function (mesaj) {
	switch (mesaj) {
		case 'restart':
			restartRequest = true;
			for (var i in acikPencereler) {
				acikPencereler[i].close();
			}
		break;
	}
});