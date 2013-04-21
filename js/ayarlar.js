$(document).ready(function () {

  function tarihGAY(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var dmy = '' + (d<= 9 ? '0' + d : d) + '.' + (m<=9 ? '0' + m : m) + '.' + y;
    return dmy;
  }

  function ogretim_turu_degistir (ogretim_turu) {
    
    if (ogretim_turu == 'ikili')
      $('#ikili_ogretim_alani').show();
    else
      $('#ikili_ogretim_alani').hide();

    $('#nobet_listesi').html('<tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr>');
    var kategoriler = $('#nobet_kategorileri').val().split(',');
    var gunler = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
    if($('#nobet_kategorileri').val() != "") {
      $('#nobet_listesi tr:first').html('<td></td>');
      for (var kategori in kategoriler) {
        $('#nobet_listesi tr:first').append('<td>'+kategoriler[kategori]+'</td>');
      }
      var bugun = new Date();
      $('#nobet_listesi tr:not(:first)').each(function (i, j){
        var tarih = new Date(bugun.setDate(bugun.getDate() - bugun.getDay()+i+1));
        $(this).html('<td width="8%" align="center">'+tarihGAY(tarih)+'<br />'+gunler[((i+1)%7)]+'</td>');
        for (var kategori in kategoriler) {
          if (ogretim_turu == 'ikili') {
            $(this).append('<td>'
              +'<input type="text" id="nobetliste_g'+((i+1)%7)+'_sabah_k'+kategori+'" /><br />'
              +'<input type="text" id="nobetliste_g'+((i+1)%7)+'_oglen_k'+kategori+'" /></td>');
          }
          else {
            $(this).append('<td>'
              +'<input type="text" id="nobetliste_g'+((i+1)%7)+'_tamgn_k'+kategori+'" /></td>');
          }
        }
      });
    }
    else {
      $('#nobet_listesi').html('<tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr>');
    }
    
  }

  function autosuggest() {
    $.ajax({
        url : encodeURI('http://autocomplete.wunderground.com/aq?query=' + $('input[name="adres"]').val()),
        dataType : "json",
        success : function (response) {
          $('#suggest').empty();
          for (var i in response.RESULTS)
            $('#suggest').append('<option value="'+response.RESULTS[i].name+'"></option>');
        }
      });
    }

  chrome.storage.local.get(function (degerler) {
    
    $('#okul_adi').val(degerler.okul_adi);
    $('#duyuru').val(degerler.duyuru);
    $('#scrolldelay').val(degerler.scrolldelay);
    $('#scrollamount').val(degerler.scrollamount);
    $('#slayt_hizi').val(degerler.slayt_hizi);
    $('#nob_per_punto').val(degerler.nob_per_punto);
    $('#apikey').val(degerler.apikey);
    $('#adres').val(degerler.adres);
    $('#nobet_kategorileri').val(degerler.nobet_kategorileri);
    $('#haber_kategorisi').val(degerler.haber_kategorisi);
    $('#haber_kategorisi > option[value="'+degerler.haber_kategorisi+'"]').attr('selected', true);
    $('input[type="radio"][name="ogretim_turu"][value="'+degerler.ogretim_turu+'"]').attr('checked', true);
    $('#version').html("LCD Pano v" + chrome.runtime.getManifest().version);
    $('#yil').html((new Date).getFullYear());
    ogretim_turu_degistir(degerler.ogretim_turu);
    $('#nobet_listesi input').each(function () {
      $(this).val(degerler[$(this).attr('id')]);
    });

    $('#adres').keypress(function () {
      clearTimeout($.data(this, 'timer'));
      var bekle = setTimeout(autosuggest, 500);
      $(this).data('timer', bekle); 
    });

    $('#resim_sec').click(function () {
      chrome.mediaGalleries.getMediaFileSystems({ interactive : 'yes' }, function (fs) {});
    });

    $('#listeyi_olustur').click(function () {
      ogretim_turu_degistir($('input[type="radio"][name="ogretim_turu"]:checked').val());
    });

    $('input[type="radio"][name="ogretim_turu"]').change(function () {
      if ($(this).val() == 'ikili')
        $('#ikili_ogretim_alani').show();
      else
        $('#ikili_ogretim_alani').hide();
    });

    $('#kapsayici').submit(function (e) {
      e.preventDefault();
      var kayitdizisi = {
        okul_adi: $('#okul_adi').val(),
        duyuru: $('#duyuru').val(),
        scrolldelay: $('#scrolldelay').val(),
        scrollamount: $('#scrollamount').val(),
        nob_per_punto: $('#nob_per_punto').val(),
        apikey: $('#apikey').val(),
        adres: $('#adres').val(),
        slayt_hizi: $('#slayt_hizi').val(),
        haber_kategorisi: $('#haber_kategorisi').val(),
        nobet_kategorileri: $('#nobet_kategorileri').val(),
        nobet_degisim_saati: $('#nobet_degisim_saati').val(),
        ogretim_turu : $('input[type="radio"][name="ogretim_turu"]:checked').val(),
      };
      $("#nobet_listesi input").each(function () {
        kayitdizisi[$(this).attr('id')] = $(this).val();
      });
      chrome.storage.local.clear(function () {
        chrome.storage.local.set(kayitdizisi, function () {
          chrome.alarms.clearAll();
          chrome.runtime.sendMessage('restart');
        });
      });
    });
    
  });
});


