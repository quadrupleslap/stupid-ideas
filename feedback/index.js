stat.onclick = async function () {

delete stat.onclick;
stat.textContent = 'Loading…';

try {
    let context = new AudioContext();
    let audio = new Audio();
    let outputs = document.createElement('select');

    // Load the list of output devices.

    let devices = await navigator.mediaDevices.enumerateDevices();

    outputs.required = true;
    for (let device of devices) {
        if (device.kind != 'audiooutput') continue;
        let option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label;
        outputs.add(option);
    }

    outputs.addEventListener('change', e => {
        let id = outputs.options[outputs.selectedIndex].value;
        audio.setSinkId(id);
    });

    document.body.appendChild(outputs);

    // Load the input stream.

    let stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            autoGainControl: false,
            echoCancellation: true,
            noiseSuppression: false
        }
    });

    // Play the input stream to the selected output device.

    let source = context.createMediaStreamSource(stream);
    let sink = context.createMediaStreamDestination();
    source.connect(sink);

    audio.srcObject = sink.stream;
    audio.play();
    stat.textContent = 'Looping!';
} catch (e) {
    stat.textContent = 'Failed.';
    console.error(e);
}

};
