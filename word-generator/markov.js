function Markov(jmp, cdf) {
    this.jmp = jmp;
    this.cdf = cdf;
}

Markov.START = Symbol('START');
Markov.END = Symbol('END');

Markov.prototype.first = function () {
    return this.next(Markov.START);
};

Markov.prototype.next = function (prev) {
    let jmp = this.jmp[prev];
    let cdf = this.cdf[prev];

    if (cdf == undefined || cdf.length == 0)
        return Markov.END;

    let x = Math.random();
    let i = null;

    let min = 0;
    let max = cdf.length - 1;

    while (min < max) {
        let mid = (min + max) >>> 1;
        let cd  = cdf[mid];

        if (cd > x) {
            max = mid;
        } else if (cd < x) {
            min = mid + 1;
        } else {
            i = mid + 1;
            break;
        }
    }

    if (min == max)
        i = min;

    return jmp[i];
};

Markov.prototype.walk = function () {
    let seq = [this.first()];

    while (seq[seq.length - 1] != Markov.END) {
        seq.push(this.next(seq[seq.length - 1]));
    }

    seq.pop();
    return seq;
};

Markov.Builder = function () {
    this.jmp = {};
    this.cnt = {};
};

Markov.Builder.prototype.add = function (seq) {
    if (seq.length == 0)
        return;

    seq.unshift(Markov.START);
    seq.push(Markov.END);

    for (let i = 1; i < seq.length; i++) {
        let prev = seq[i - 1];
        let next = seq[i];

        if (this.jmp.hasOwnProperty(prev)) {
            jmp = this.jmp[prev];
            jmp[next] = (jmp.hasOwnProperty(next) ? jmp[next] : 0) + 1;
            this.cnt[prev] += 1;
        } else {
            this.jmp[prev] = {};
            this.jmp[prev][next] = 1;
            this.cnt[prev] = 1;
        }
    }

    seq.shift();
    seq.pop();
};

Markov.Builder.prototype.build = function () {
    let jmps = {};
    let cdfs = {};

    let prevs = Object.keys(this.jmp);
    prevs.push(Markov.START);

    prevs.forEach(prev => {
        let jmp = [];
        let cdf = [];
        let tot = 0;
        let cnt = this.cnt[prev];
        let tbl = this.jmp[prev];

        for (let next in tbl) {
            if (!tbl.hasOwnProperty(next))
                continue;

            tot += tbl[next];
            jmp.push(next);
            cdf.push(tot / cnt);
        }

        cdf[cdf.length - 1] = 1;

        jmps[prev] = jmp;
        cdfs[prev] = cdf;
    });

    return new Markov(jmps, cdfs);
};
