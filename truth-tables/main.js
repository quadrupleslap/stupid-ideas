const OPS = {
    'IMPLIES': {
        priority: -1,
        arity: 2,
        left: false,
        right: true,
        apply: xs => {
            let r = xs.pop(), l = xs.pop();
            xs.push(!l || r);
        },
    },
    'XOR':  {
        priority: 0,
        arity: 2,
        left: true,
        right: true,
        apply: xs => {
            let r = xs.pop(), l = xs.pop();
            xs.push(l != r);
        },
    },
    'OR':  {
        priority: 0,
        arity: 2,
        left: true,
        right: true,
        apply: xs => {
            let r = xs.pop(), l = xs.pop();
            xs.push(l || r);
        },
    },
    'AND': {
        priority: 1,
        arity: 2,
        left: true,
        right: true,
        apply: xs => {
            let r = xs.pop(), l = xs.pop();
            xs.push(l && r);
        },
    },
    'NOT': {
        priority: 2,
        arity: 1,
        left: false,
        right: true,
        apply: xs => {
            let x = xs.pop();
            xs.push(!x);
        },
    },
};

function parse(words) {
    let ops = [];
    let out = [];

    for (let word of words) {
        if (word == '(') {
            ops.push('(');
        } else if (word == ')') {
            while (true) {
                let op = ops.pop();

                if (op == '(') {
                    break;
                } else if (op == undefined) {
                    throw 'Unexpected ")".';
                }

                out.push(op);
            }
        } else if (OPS.hasOwnProperty(word)) {
            let a = OPS[word];

            while (ops.length > 0 && ops[ops.length - 1] != '(') {
                let b = OPS[ops[ops.length - 1]];

                if (b.priority > a.priority) {
                    out.push(ops.pop());
                } else if (b.priority < a.priority) {
                    break;
                } else if (b.left) {
                    out.push(ops.pop());
                } else {
                    break;
                }
            }

            ops.push(word);
        } else {
            out.push(word);
        }
    }

    while (ops.length > 0) {
        let op = ops.pop();
        if (op == '(') throw 'Unmatched "(".';
        out.push(op);
    }

    return out;
}

function lex(s) {
    let out = [],
        tok = '';

    for (let c of s) {
        if (c == ' ') {
            if (tok != '') {
                out.push(tok);
                tok = '';
            }
        } else if (c == '(' || c == ')') {
            if (tok != '') {
                out.push(tok);
                tok = '';
            }

            out.push(c);
        } else {
            tok += c;
        }
    }

    if (tok != '') {
        out.push(tok);
    }

    return out;
}

function boolEval(expr, truths) {
    let out = [];

    for (let x of expr) {
        if (OPS.hasOwnProperty(x)) {
            OPS[x].apply(out);
        } else {
            out.push(truths[x]);
        }
    }

    return out.pop();
}

function truthTable(ss) {
    // Convert everything to upper-case because we are retro.

    ss = ss.map(s => s.toUpperCase());

    // Compile all the things.

    let exps = ss.map(s => parse(lex(s))),
        vars = [];

    for (let expr of exps) {
        for (let x of expr) {
            if (!(OPS.hasOwnProperty(x) || vars.includes(x))) {
                vars.push(x);
            }
        }
    }

    vars.sort();

    // Make the table.

    let table = document.createElement('table');
    let header = table.insertRow();

    for (let v of vars) {
        let cell = document.createElement('th');
        cell.textContent = v;
        header.appendChild(cell);
    }

    for (let s of ss) {
        let cell = document.createElement('th');
        cell.textContent = s;
        header.appendChild(cell);
    }

    // Compute the rows.

    let f = (truths, done) => {
        if (done == vars.length) {
            let row = table.insertRow();

            for (let v of vars) {
                let cell = row.insertCell();
                cell.className = truths[v] ? 'true' : 'false';
            }

            for (let expr of exps) {
                let cell = row.insertCell();
                cell.className = boolEval(expr, truths) ? 'true' : 'false';
            }

            return;
        }

        truths[vars[done]] = false;
        f(truths, done + 1);
        truths[vars[done]] = true;
        f(truths, done + 1);
    };

    f({}, 0);
    return table;
}

function update() {
    let input = document.getElementById('input');
    let output = document.getElementById('output');

    // Clear the output.

    while (output.firstChild) output.firstChild.remove();

    // Fetch the input strings.

    let ss = input.value.split('\n').filter(s => s);

    // Compute and display the output.

    try {
        output.appendChild(truthTable(ss));
    } catch (e) {
        output.textContent = e.toString();
    }
}
