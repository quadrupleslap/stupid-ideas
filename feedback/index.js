(async function () {

try {
    document.body.textContent = 'Loading…';
    let stream = await navigator.mediaDevices.getUserMedia({audio: true});
    let audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.onloadedmetadata = e => {
        audio.play();
        document.body.textContent = 'Looping!';
    };
} catch (e) {
    document.body.textContent = 'Failed.'
    console.error(e);
}

})();
