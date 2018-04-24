import EventEmitter from 'events';

let _audio_meter = null;
let _media_stream_source = null;
let _audio_meter_supported = true;

const volume_emitter = new EventEmitter();
const CHANGE_EVENT = "change";
const AUDIO_CONTEXT = window.AudioContext || window.webkitAudioContext;
const audioContext = new AUDIO_CONTEXT();

if(audioContext.createMediaStreamSource) {
  _audio_meter_supported = false;
  _audio_meter = _createAudioMeter(audioContext);

  _media_stream_source = audioContext.createMediaStreamSource(videoStream);
  _media_stream_source.connect(_audio_meter);
}

function _createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    let processor = audioContext.createScriptProcessor(512);

    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;

    // Chrome bug work-around
    processor.connect(audioContext.destination);

    processor.onaudioprocess = function( event ) {
        let sum = 0;
        let buf = event.inputBuffer.getChannelData(0);

        // Do a root-mean-square on the samples: sum up the squares...
        _.each(buf, (value) => {
          if (Math.abs(value) >= processor.clipLevel) {
              processor.clipping = true;
              processor.lastClip = window.performance.now();
          }
          sum += value * value;
        })

        processor.volume = Math.max(Math.sqrt(sum / buf.length),
                                    processor.volume * processor.averaging);

        volume_emitter.emit(CHANGE_EVENT, 'updated');
    };

    processor.checkClipping = function() {
      if (!this.clipping)
        return false;
      if ((this.lastClip + this.clipLag) < window.performance.now())
        this.clipping = false;
      return this.clipping;
    };

    processor.shutdown = function() {
      this.disconnect();
      this.onaudioprocess = null;
    };

    return processor;
}

function addChangeListener(callback) {
  volume_emitter.on(CHANGE_EVENT, callback);
}
function getClipping() {
  let clipping = false;
  if(_audio_meter_supported) {
    clipping = _audio_meter.checkClipping();
  }
  return clipping;
}
function getVolume() {
  let volume = 0;
  if(_audio_meter_supported) {
    volume = _audio_meter.volume;
  }
  return volume;
}
function once(callback) {
  volume_emitter.once(CHANGE_EVENT, callback);
}
function removeChangeListener(callback) {
  volume_emitter.removeListener(CHANGE_EVENT, callback);
}
function shutdown() {
  if(_audio_meter_supported) {
    _audio_meter.shutdown();
  }
}

export default {
  addChangeListener,
  one,
  removeChangeListener,
  shutdown
};
