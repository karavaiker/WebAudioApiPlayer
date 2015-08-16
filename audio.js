// создаем аудио контекст
var context = new window.AudioContext();
//создаем анализатор для визуализации
var analyser = context.createAnalyser();

// переменные для буфера, источника и получателя
var buffer, source, destination;


// функция для подгрузки файла в буфер
var loadSoundFile = function(url) {
    // делаем XMLHttpRequest (AJAX) на сервер
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        // декодируем бинарный ответ
        context.decodeAudioData(this.response,
        function(decodedArrayBuffer) {
            // получаем декодированный буфер
            buffer = decodedArrayBuffer;
        }, function(e) {
        console.log('Error decoding file', e);
        });
    };
    xhr.send();
}


// функция начала воспроизведения
function play(){ 
    source = context.createBufferSource();
    source.buffer = buffer;
    destination = context.destination;
    
    // подключаем источник --> анализатору спектра ->получатель
    source.connect(analyser);
    analyser.connect(destination);     
    
    // воспроизводим
    source.start(0);
    }
// функция остановки воспроизведения
var stop = function(){
    source.stop(0);
}
// ниже 2 функции для считывания id3 тегов
function loadFile(file) {    
        url = file.urn || file.name;
        
    ID3.loadTags(url, function () {
        showTags(url);
    }, {
        tags: ["title", "artist", "album","year","genre", "picture"],
        dataReader: FileAPIReader(file)
    });

     $('#nameFile').text(file.name);
}

function showTags(url) {
      var tags = ID3.getAllTags(url);
      console.log(tags);
      document.getElementById('nameTitle').textContent = tags.title || "";
      document.getElementById('nameArtist').textContent = tags.artist || "";
      document.getElementById('nameAlbum').textContent = tags.album || "";
      document.getElementById('nameYear').textContent = tags.year || "";      
      var image = tags.picture;
      if (image) {
        var base64String = "";
        for (var i = 0; i < image.data.length; i++) {
            base64String += String.fromCharCode(image.data[i]);
        }
        var base64 = "data:" + image.format + ";base64," +
                window.btoa(base64String);
        document.getElementById('picture').setAttribute('src',base64);
      } else {
        document.getElementById('picture').style.display = "none";
      }
    }

//Добавить фаил в буфер из input
function processFiles(e) {
    
    document.location.href = '#close';

    $('#fileStatus').text('Идет загрузка фаила...')
    var reader = new FileReader();

    reader.onload = function (e) {

        
        if (context.decodeAudioData) {
            context.decodeAudioData(e.target.result, function(b) {
                buffer = b;
                $('#fileStatus').text('Готово');
                
            }, function(e) {
                clog(e);
                alert('Audio not playable or not supported.');
            });
        }
        else {
            buffer = context.createBuffer(e.target.result, true);            
        }
    }

    reader.readAsArrayBuffer(e.files[0]);
    loadFile(e.files[0]);
}

//Добавить фаил в буфер из Drag N drop зоны
function DropFiles(e) {
    
 $('#fileStatus').text('Идет загрузка фаила...')   
 var reader = new FileReader();
    
    reader.onload = function(e) {
        if (context.decodeAudioData) {
            context.decodeAudioData(e.target.result, function(b) {
                buffer = b;
                $('#fileStatus').text('Готово');
                
            }, function(e) {
                alert('Audio not playable or not supported.');
            });
        }
        else {
            buffer = context.createBuffer(e.target.result, true);            
        }
    }

    reader.readAsArrayBuffer(e.dataTransfer.files[0]);
    loadFile(e.dataTransfer.files[0]);
}


//Обработчик Drag and drop
$(document).ready(function() {
    var dropZone=$('#fileZone');
        
    
    if (typeof(window.FileReader) == 'undefined') {
        dropZone.text('Drag & Drop не поддерживается браузером!');
        dropZone.addClass('error');    
    }   
    
    dropZone[0].ondragover = function() {
        dropZone.addClass('hover');
        return false;
    };
    
    dropZone[0].ondragleave = function() {
        dropZone.removeClass('hover');
        return false;
    };
    
    dropZone[0].ondrop = function(event) {
        event.preventDefault();
        DropFiles(event);
        dropZone.removeClass('hover');
        dropZone.addClass('drop');
    };

});

      


$(function() {
    $('#visualizer').hide();
    
    $('#playbtn').click(function() {
        play();        
    });
    
    $('#stopbtn').click(function() {
        stop();
    });
    
    $('.tabmeta').click(function() {        
        $('.fileInfo').show();
        $('#visualizer').hide();
    });
    
    $('.tabspectrum').click(function() {        
        $('.fileInfo').hide();
        $('#visualizer').show();
        spectrum();
    });
    
    $('.tabwave').click(function() {
        $('.fileInfo').hide();
        $('#visualizer').show();
        waveform();
    });
    
});


//Canvas для визуализации

var canvas = document.getElementById('visualizer');
var canvasCtx = canvas.getContext('2d');

//функция для вывода визуализации: specrum;
function spectrum() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(0, 166, 80)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',255,255)';
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };
    draw();
}


//Функция отрисовки варианта визуализации waveform
function waveform() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

    analyser.fftSize = 2048;
    var bufferLength = analyser.fftSize;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {

      drawVisual = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.62)';

      canvasCtx.beginPath();

      var sliceWidth = WIDTH * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
   
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
    };

    draw();
}







