const gunler = [ "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi" ];
const aylar = [ "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" ];
const uzantilar = ['png', 'bmp', 'jpeg', 'jpg', 'gif', 'png', 'svg', 'xbm', 'webp'];
var fsIndex = 0, galeriIndex = 0;
var fs = null;
var imageArray = new Array();
var alarmsayisi = 0;
var slayt_hizi = 0;
chrome.alarms.clearAll();

function tamEkranToggle () {
  if (!document.webkitIsFullScreen)
    document.body.webkitRequestFullscreen();
  else
    document.webkitExitFullscreen();
}

function zoomSeviyesiniAyarla () {
  var g = $(window).width();
  var y = $(window).height();
  var z = y / 675;
  if (z * 1200 > g)
    z = g / 1200;
  $('#main').attr('style', 'zoom: '+z+' !important');
}

function havaDurumuHaberGuncelle () {
  chrome.storage.local.get(function(degerler) {
    $.ajax({
      url : encodeURI('http://api.wunderground.com/api/' + degerler.apikey + '/geolookup/conditions/lang:TR/q/IA/' + degerler.adres + '.json'),
      dataType : "json",
      success : function (response) {
        if (response.response.error) {
          $('#hava_durumu_icerik').html('<div style="padding: 10px; text-align: center;">HATA: Hava durumu bilgisi alınamıyor. Uygulamayı ilk kez çalıştırıyorsanız lütfen sağ tık menüsünden Ayarlar\'a girip wunderground.com API anahtarınızı ve il-ilçe bilginizi giriniz.</div>');
        }
        else {
          var saat = (new Date()).getHours();
          var gecegunduz = (saat >= 6 && saat < 18) ? 'hava_gunduz' : 'hava_gece';
          $('#weatherItem').css('background-position', '10px center');
          $('#weatherItem').css('background-image', 'url(\'img/' + gecegunduz + '/' + response.current_observation.icon + '.png\')');
          $('#weatherCity').html(response.location.city);
          $('#weatherTemp').html(response.current_observation.temp_c + '&deg;C');
          //console.log(response);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        $('#hava_durumu_icerik').html('<div style="padding: 10px; text-align: center;">HATA: Hava durumu bilgisi alınamıyor. Lütfen internet bağlantınızı kontrol edin.</div>');
      }
    });

var trthbr = document.getElementById('trthaber');
trthbr.src = 'http://www.trthaber.com/sitene-ekle/'+ degerler.haber_kategorisi +'/?haberSay=5&renk=a&baslik=0&resimler=1';
});
}

function tarihSaatGuncelle () {
  var tarihsaat = new Date();
  var saat = tarihsaat.toTimeString().substr(0,5);
  var tarih = tarihsaat.getDate() + " " + aylar[tarihsaat.getMonth()] + " " + tarihsaat.getFullYear() + ", " + gunler[tarihsaat.getDay()];
  $('#tarih').html(tarih);
  $('#saat').html(saat);
}

function icerigiDoldur() {
  chrome.storage.local.get(function (degerler) {
    slayt_hizi = degerler.slayt_hizi;
    $('#okul_adi').text(degerler.okul_adi);
    $('#duyuru').text(degerler.duyuru);
    $('#duyuru').attr('scrollamount', degerler.scrollamount);
    $('#duyuru').attr('scrolldelay', degerler.scrolldelay);
    $('#nobetci_per_icerik').css('font-size', degerler.nob_per_punto + 'px');

    var pattern = '';
    if (degerler.ogretim_turu == 'ikili') {
      var sabahoglen = (new Date().toTimeString().substr(0,5) < degerler.nobet_degisim_saati) ? 'sabah' : 'oglen';
      pattern = 'nobetliste_g' + new Date().getDay() + '_' + sabahoglen + '_';
    }
    else {
      pattern = 'nobetliste_g' + new Date().getDay() + '_tamgn_';
    }
    var kategoriler = degerler.nobet_kategorileri.split(',');
    var i = 0;
    $('#nobetci_per_tablo').empty();
    $.each(degerler, function (index, value) {
      if (index.substr(0,20) == pattern) {
        $('#nobetci_per_tablo').append('<tr>'
          + '<td align="center" width="30%"><strong>'+ kategoriler[i] +'</strong></td>'
          + '<td width="70%" id="'+ index +'">'+ value.replace(',','<br />') +'</td></tr>');
        i++;
      }
    });
    //console.log(degerler);
  });
}

function sayaclariVeOlaylariKur () {
  $(window).resize(function() {
    zoomSeviyesiniAyarla();
  });

  chrome.alarms.create('guncelleyici', {periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(function (alarm) {
    tarihSaatGuncelle();
    icerigiDoldur();
    if (++alarmsayisi % 3 == 0) {
      havaDurumuHaberGuncelle();
    }
  });
}

function dosyalariOku () {
  if (fsIndex < fs.length) {
    var dir_reader = fs[fsIndex].root.createReader();
    dir_reader.readEntries(function(galeri) {
      if(galeri.length > 0) {
        var uzanti = galeri[galeriIndex].fullPath.substr(galeri[galeriIndex].fullPath.lastIndexOf('.') + 1).toLowerCase();
        if(galeri[galeriIndex].isFile && uzantilar.indexOf(uzanti) >= 0) {
          galeri[galeriIndex].file(function(fff) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
              var image = new Image();
              image.alt = fff.name;
              image.src = this.result;
              imageArray.push(image);
              if (++galeriIndex >= galeri.length) { 
                galeriIndex = 0;
                fsIndex++;
              }
              dosyalariOku();
            };
            reader.readAsDataURL(fff);
          });
        }
        else {
          if (++galeriIndex >= galeri.length) { 
            galeriIndex = 0;
            fsIndex++;
          }
          dosyalariOku();
        }
      }
      else {
        $('#slider').css('background-image', 'none');
        $('#slider').html('<div style="margin-top: 100px;"><strong>SEÇTİĞİNİZ KOLEKSİYONDA RESİM BULUNAMADI.</strong></div>');
      }
    });
} else {
  fsIndex = 0;
  galeriIndex = 0;
  if(imageArray.length > 0) {
    $('#slider').css('background-image', 'none');
    $('#slider').append(imageArray);
    imageArray = new Array();
    window.f = new flux.slider('#slider', { autoplay: true, delay: (slayt_hizi * 1000), pagination: false });
  }
  else {
    $('#slider').css('background-image', 'none');
    $('#slider').html('<div style="margin-top: 100px;"><strong>SEÇTİĞİNİZ KOLEKSİYONDA RESİM BULUNAMADI.</strong></div>');
  }
}
}

function slaytiOlustur () {
  chrome.mediaGalleries.getMediaFileSystems({ interactive : 'if_needed' }, function (fsx) {
    if (fsx.length > 0) {
      fs = fsx;
      dosyalariOku();
    }
    else {
      fs = null;
      $('#slider').css('background-image', 'none');
      $('#slider').html('<div style="margin-top: 100px;"><strong>SLAYT OLARAK GÖRÜNTÜLENMEK ÜZERE HİÇBİR RESİM KOLEKSİYONUNA ERİŞİM İZNİ VERMEDİNİZ.<br /><br/>'
        + 'Lütfen ayarlardan "Slayt Resimlerini Seç/Değiştir" butonuna tıklayıp gerekli izinleri sağlayınız.</strong></div>');
    }
  });
}



$(document).ready(function () {

  zoomSeviyesiniAyarla();
  icerigiDoldur();
  tarihSaatGuncelle();
  havaDurumuHaberGuncelle();
  slaytiOlustur();
  sayaclariVeOlaylariKur();

});