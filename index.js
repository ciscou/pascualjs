(function() {
  const form = document.getElementById("form");
    const textarea = document.getElementById("code");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const parser = new Parser(textarea.value);
    parser.parse();
    console.log(parser.variables());
  });

  const KEYWORDS = ["program", "begin", "end"];

  class Parser {
    constructor(input) {
      this.lexer = new Lexer(input);
      this._variables = {};
    }

    parse(input) {
      this.lexer.consume("program");
      this.lexer.consume("ID");
      this.lexer.consume("SEMICOLON");
      this.lexer.consume("begin");
      this.instructions();
      this.lexer.consume("end");
      this.lexer.consume("DOT");
      this.lexer.consume("EOF");
    }

    instructions() {
      this.instruction();

      while(true) {
        const token = this.lexer.peek();
        if(token.type === "SEMICOLON") {
          this.lexer.consume("SEMICOLON");
          this.instruction()
        } else {
          break;
        }
      }
    }

    instruction() {
      const token = this.lexer.peek();
      if(token.type === "end") return;

      const id = this.lexer.consume("ID");
      this.lexer.consume("ASSIGN");
      const expression = this.expression();

      this._variables[id.val] = expression;
      console.log(id, expression);
    }

    expression() {
      let a = this.factor();

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "ADD") {
          this.lexer.consume("ADD");
          a = a + this.factor();
        } else if(token.type === "SUB") {
          this.lexer.consume("SUB");
          a = a - this.factor();
        } else {
          break;
        }
      }

      return a;
    }

    factor() {
      let a = this.term();

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "MUL") {
          this.lexer.consume("MUL");
          a = a * this.term();
        } else if(token.type === "DIV") {
          this.lexer.consume("DIV");
          a = a / this.term();
        } else {
          break;
        }
      }

      return a;
    }

    term() {
      const token = this.lexer.peek();

      if(token.type === "INTEGER_LITERAL") {
        this.lexer.consume("INTEGER_LITERAL");
        return parseInt(token.val);
      } else if(token.type === "ID") {
        this.lexer.consume("ID");
        return this._variables[token.val];
      } else {
        this.lexer.consume("INTEGER_LITERAL");
      }
    }

    variables() {
      return this._variables;
    }
  }

  class Lexer {
    constructor(input) {
      this.input = input;
      this.offset = 0;
      this.line = 1;
      this.col = 1;
    }

    consume(type) {
      const token = this.nextToken();
      if(token.type !== type) {
        throw(`Unexpected token at line ${token.line}, col ${token.col}, expected ${type}, got ${token.type}`);
      }

      return token;
    }

    peek() {
      const offset = this.offset;
      const line = this.line;
      const col = this.col;

      const token = this.nextToken();

      this.offset = offset;
      this.line = line;
      this.col = col;

      return token;
    }

    nextToken() {
      this.skipWhitespace();

      const token = { line: this.line, col: this.col, val: "" };

      if(this.offset >= this.input.length) {
        token.type = "EOF";
        return token;
      }

      if(this.input[this.offset].match(/[a-zA-Z]/)) {
        while(this.offset < this.input.length && this.input[this.offset].match(/[a-zA-Z0-9_]/)) {
          token.val += this.input[this.offset];
          this.offset++;
        }

        if(KEYWORDS.includes(token.val)) {
          token.type = token.val;
        } else {
          token.type = "ID";
        }
      } else if(this.input[this.offset].match(/[0-9]/)) {
        while(this.offset < this.input.length && this.input[this.offset].match(/[0-9]/)) {
          token.val += this.input[this.offset];
          this.offset++;
        }

        token.type = "INTEGER_LITERAL";
      } else if(this.offset + 1 < this.input.length && this.input[this.offset] === ":" && this.input[this.offset + 1] === "=") {
        token.val = ":=";
        this.offset += 2;
        token.type = "ASSIGN";
      } else if(this.input[this.offset] === ".") {
        token.val = ".";
        this.offset++;
        token.type = "DOT";
      } else if(this.input[this.offset] === ";") {
        token.val = ";";
        this.offset++;
        token.type = "SEMICOLON";
      } else if(this.input[this.offset] === "+") {
        token.val = "+";
        this.offset++;
        token.type = "ADD";
      } else if(this.input[this.offset] === "-") {
        token.val = "-";
        this.offset++;
        token.type = "SUB";
      } else if(this.input[this.offset] === "*") {
        token.val = "*";
        this.offset++;
        token.type = "MUL";
      } else if(this.input[this.offset] === "/") {
        token.val = "/";
        this.offset++;
        token.type = "DIV";
      } else {
        throw(`Unknown token ${this.input[this.offset]} at line ${this.line}, col ${this.col}`);
      }

      this.col += token.val.length;

      return token;
    }

    skipWhitespace() {
      while(this.offset < this.input.length && this.isWhitespace(this.input[this.offset])) {
        if(this.input[this.offset] === "\n") {
          this.line++;
          this.col = 1;
        } else {
          this.col++;
        }

        this.offset++;
      }
    }

    isWhitespace(char) {
      return char === " " || char === "\t" || char === "\n"
    }
  }
})();
