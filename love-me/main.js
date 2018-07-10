document.addEventListener('DOMContentLoaded', () => {
    Promise.all([load('m.mp3'), load('f.mp3')])
        .then(xs => bodyclick().then(() => xs))
        .then(([m, f]) => init(m, f))
        .catch(e => {
            show('ERROR');
            console.error(e);
        });
});

function init(m, f) {
    let start = Date.now();

    let id = setInterval(() => {
        let span = Date.now() - start;
        let ms = span % 1000;
        span = (span / 1000) |0;
        let s = span % 60;
        span = (span / 60) |0;
        let m = span % 60;
        span = (span / 60) |0;
        let h = span;
        show(`${zp(h,2)}:${zp(m,2)}:${zp(s,2)}.${zp(ms,3)}`);
    }, 1);

    m.muted = true;

    let ekd = e => { if (e.key == ' ') swap(m, f); };
    let eck = e => { swap(m, f); }
    document.addEventListener('keydown', ekd);
    document.addEventListener('click', eck);

    return main([m, f]).catch(e => {
        clearInterval(id);
        document.removeEventListener('keydown', ekd);
        document.removeEventListener('click', eck);
        throw e;
    });
}

function main(songs) {
    let ended = songs.map(play);

    return Promise.all(ended).then(() => {
        songs.forEach(song => {
            song.playbackRate = Math.min(song.playbackRate + 0.05, 16);
        });

        return main(songs);
    });
}

function swap(m, f) {
    document.body.classList.toggle('invert');

    if (m.muted) {
        m.muted = false;
        f.muted = true;
    } else {
        m.muted = true;
        f.muted = false;
    }
}

function play(audio) {
    let end = new Promise((resolve, reject) => {
        let h, r;

        h = () => {
            audio.removeEventListener('ended', h);
            audio.removeEventListener('error', r);
            resolve();
        };

        r = () => {
            audio.removeEventListener('ended', h);
            audio.removeEventListener('error', r);
            reject(audio.error);
        };

        audio.addEventListener('ended', h);
        audio.addEventListener('error', r);
    });

    return audio.play().then(() => end);
}

function load(url) {
    return new Promise(resolve => {
        var audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        audio.addEventListener('canplaythrough', () => resolve(audio));
    });
}

function bodyclick() {
    return new Promise(resolve => {
        show('CLICK');

        let r = () => {
            document.removeEventListener('click', r);
            resolve();
        };

        document.addEventListener('click', r);
    });
}

function show(s) {
    document.getElementById('time').textContent = s;
}

function zp(s,n) {
    s = s + '';
    while (s.length < n) {
        s = '0' + s;
    }
    return s;
}

