(async function () {

try {
    let audio = document.createElement('audio');
    let outputs = document.createElement('select');

    stat.textContent = 'Loading…';

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

    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Play the input stream to the selected output device.

    audio.srcObject = stream;
    audio.onloadedmetadata = e => {
        audio.play();
        stat.textContent = 'Looping!';
    };
} catch (e) {
    stat.textContent = 'Failed.';
    console.error(e);
}

})();
