// создаем аудио контекст
var context = new window.AudioContext();
//создаем нод анализатора

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
var play = function(){
    // создаем источник
    source = context.createBufferSource();
    // подключаем буфер к источнику
    source.buffer = buffer;
    // дефолтный получатель звука
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

//ЗАГРУЗКА ФАИЛА
loadSoundFile('music.mp3');

$(function() {
    $('#playbtn').click(function() {
        play();
        visualize();
    });
    
    $('#stopbtn').click(function() {
        stop();
    });
});

//Canvas для визуализации

var canvas = document.getElementById('visualizer');
var canvasCtx = canvas.getContext('2d');

analyser.fftSize=2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

canvasCtx.clearRect(0, 0, WITH, HEIGHT);

function visualize() {
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


