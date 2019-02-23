// TUTORIAL

const TUTORIAL = `\
# Render Markdown

Now you can write your résumé in Markdown! And maybe other stuff, too.

- Drop a file here to render it.
- Insert math with \`<math-div>\` and \`<math-span>\` elements.
- The editor will magically disappear when you print this page.

## Credits

- Prism highlights the code.
- Marked renders the GitHub-flavored Markdown.
- KaTeX renders the math.
- The code editor is Ace.
- The font is Roboto Slab, designed by Christian Robertson and commissioned and
  hosted by Google.
- All the libraries are hosted by CDNJS.

--------

## The Fibonacci Sequence

> The Fibonacci sequence is the jewel of mathematics. *- Leonhard Euler*

You can find more information about Leonhard Euler, a very obscure
mathematician, at [Project Euler](https://projecteuler.net), which is an archive
of his many works. Anyway, here's the famous Fibonacci sequence.

<math-div>
\\begin{aligned}
    F_0 &= 0 \\\\
    F_1 &= 1 \\\\
    F_n &= F_{n-1} + F_{n-2}
\\end{aligned}
</math-div>

And here is an efficient implementation in an esoteric programming language
named Python.

\`\`\`python
def fib(n):
    if n <= 1: return n
    return fib(n - 1) + fib(n - 2)
\`\`\`

Isn't it beautiful?
`;

// EDITOR

let editor = ace.edit("editor", {
    mode: "ace/mode/markdown",
    theme: "ace/theme/dawn",
    printMargin: false,
    showLineNumbers: false,
    useSoftTabs: true,
    tabSize: 4,
    wrap: true,
    fontSize: 16,
});

editor.on("change", () => {
    let md = editor.getValue();
    let render = document.getElementById("render");
    render.innerHTML = marked(md, { gfm: true });
    Prism.highlightAllUnder(render);
});

editor.setValue(TUTORIAL, -1);
editor.focus();

// MATH ELEMENTS

class MathDiv extends HTMLElement {
    constructor(inline = false) {
        super();
        this.inline = inline;
    }

    connectedCallback() {
        let source = this.textContent;
        let target = document.createElement(this.inline ? "span" : "div");

        katex.render(source, target, {
            throwOnError: false,
            displayMode: !this.inline,
        });

        while (this.firstChild) this.firstChild.remove();
        this.appendChild(target);
    }
}

class MathSpan extends MathDiv {
    constructor() {
        super(true);
    }
}

customElements.define("math-div", MathDiv);
customElements.define("math-span", MathSpan);

// DRAG-AND-DROP

document.body.addEventListener("drop", e => {
    if (!e.dataTransfer.items) return;
    for (let item of e.dataTransfer.items) {
        if (item.kind != 'file') continue;

        e.preventDefault();

        read(item.getAsFile()).then(text => {
            editor.setValue(text, -1);
        });

        break;
    }
});

document.body.addEventListener("dragover", e => {
    e.preventDefault();
});

function read(f) {
    return new Promise((resolve, reject) => {
        let r = new FileReader();
        r.addEventListener('loadend', () => {
            if (r.readyState == 2) {
                resolve(r.result);
            } else {
                reject(r.error);
            }
        });
        r.readAsText(f);
    });
}
