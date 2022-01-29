(function() {
  const form = document.getElementById("form");
  const textarea = document.getElementById("code");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const parser = new Parser(textarea.value);
    const ast = parser.parse();

    ast.simulate();

    console.log(ast);
  });

  class ProgramNode {
    constructor(name, symTable, instructions) {
      this.name = name;
      this.symTable = symTable;
      this.instructions = instructions;
    }

    simulate() {
      this.instructions.forEach(instruction => instruction.simulate());
    }
  }

  class IfInstructionNode {
    constructor(condition, ifInstruction, elseInstruction) {
      this.condition = condition;
      this.ifInstruction = ifInstruction;
      this.elseInstruction = elseInstruction;
    }

    simulate() {
      if(this.condition.simulate()) {
        this.ifInstruction.simulate();
      } else {
        this.elseInstruction.simulate();
      }
    }
  }

  class AssignmentInstructionNode {
    constructor(variable, expression) {
      this.variable = variable;
      this.expression = expression;
    }

    simulate() {
      this.variable.value = this.expression.simulate();
    }
  }

  class NoOpNode {
    simulate() {
      // well... no-op. surprise!
    }
  }

  class IntegerAddNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate() {
      return this.a.simulate() + this.b.simulate();
    }
  }

  class IntegerSubNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate() {
      return this.a.simulate() - this.b.simulate();
    }
  }

  class IntegerMulNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate() {
      return this.a.simulate() * this.b.simulate();
    }
  }

  class IntegerDivNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      // TODO type is Real???
      this.type = "Integer";
    }

    simulate() {
      // TODO return a float?
      return Math.floor(this.a.simulate() / this.b.simulate());
    }
  }

  class IntegerLiteralNode {
    constructor(integer) {
      this.integer = integer
      this.type = "Integer";
    }

    simulate() {
      return this.integer;
    }
  }

  class IntegerUnaryAddNode {
    constructor(expression) {
      this.expression = expression
      this.type = "Integer";
    }

    simulate() {
      return this.expression.simulate();
    }
  }

  class IntegerUnarySubNode {
    constructor(expression) {
      this.expression = expression
      this.type = "Integer";
    }

    simulate() {
      return -this.expression.simulate();
    }
  }

  class BooleanLiteralNode {
    constructor(boolean) {
      this.boolean = boolean;
      this.type = "Boolean";
    }

    simulate() {
      return this.boolean;
    }
  }

  class BooleanAndNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate() {
      const a = this.a.simulate();
      const b = this.b.simulate();
      return a && b;
    }
  }

  class BooleanOrNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate() {
      const a = this.a.simulate();
      const b = this.b.simulate();
      return a || b;
    }
  }

  class BooleanNotNode {
    constructor(expression) {
      this.expression = expression;
      this.type = "Boolean";
    }

    simulate() {
      return !this.expression.simulate();
    }
  }

  class VariableNode {
    constructor(variable) {
      this.variable = variable;
      this.type = this.variable.type;
    }

    simulate() {
      return this.variable.value;
    }
  }

  class Parser {
    constructor(input) {
      this.lexer = new Lexer(input);
    }

    parse(input) {
      this.lexer.consume("program");
      const id = this.lexer.consume("ID");
      this.lexer.consume("SEMICOLON");
      const symTable = this.varsDeclarations();
      this.lexer.consume("begin");
      const instructions = this.instructions(symTable);
      this.lexer.consume("end");
      this.lexer.consume("DOT");
      this.lexer.consume("EOF");

      return new ProgramNode(id.val, symTable, instructions);
    }

    varsDeclarations() {
      const symTable = {}

      const token = this.lexer.peek();
      if(token.type === "var") {
        this.lexer.consume("var");

        while(true) {
          const token = this.lexer.peek();

          if(token.type === "ID") {
            this.varDeclaration(symTable);
          } else {
            break;
          }
        }
      }

      return symTable;
    }

    varDeclaration(symTable) {
      const varNames = [];
      varNames.push(this.lexer.consume("ID"));

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "COMMA") {
          this.lexer.consume("COMMA")
          varNames.push(this.lexer.consume("ID"));
        } else {
          break
        }
      }

      this.lexer.consume("COLON");

      const type = this.lexer.consume("TYPE");

      this.lexer.consume("SEMICOLON");

      varNames.forEach(varName => {
        if(symTable[varName.val]) throw(`Variable ${varName.val} already exists! At line ${varName.line}, col ${varName.col}`);

        symTable[varName.val] = { name: varName.val, type: type.val };
      });
    }

    instructions(symTable) {
      const res = [];

      res.push(this.instruction(symTable));

      while(true) {
        const token = this.lexer.peek();
        if(token.type === "SEMICOLON") {
          this.lexer.consume("SEMICOLON");
          res.push(this.instruction(symTable));
        } else {
          break;
        }
      }

      return res;
    }

    instruction(symTable) {
      const token = this.lexer.peek();
      if(token.type === "end") return new NoOpNode();

      if(token.type === "if") {
        return this.ifInstruction(symTable);
      } else {
        return this.assignmentInstruction(symTable);
      }
    }

    ifInstruction(symTable) {
      const token = this.lexer.consume("if");
      const condition = this.expression(symTable);
      if(condition.type !== "Boolean") {
        throw(`Invalid type for if instruction, expected Boolean, got ${condition.type} at line ${token.line}, col ${token.col}`);
      }

      this.lexer.consume("then");
      const ifInstruction = this.instruction(symTable);

      this.lexer.consume("else");
      const elseInstruction = this.instruction(symTable);

      return new IfInstructionNode(condition, ifInstruction, elseInstruction);
    }

    assignmentInstruction(symTable) {
      const varName = this.lexer.consume("ID");
      const assign = this.lexer.consume("ASSIGN");
      const expression = this.expression(symTable);

      const variable = symTable[varName.val];
      if(!variable) throw(`Variable ${varName.val} doesn't exist! At line ${varName.line}, col ${varName.col}`);

      if(variable.type !== expression.type) {
        throw(`Incompatible types ${variable.type} and ${expression.type} at line ${assign.line}, col ${assign.col}`);
      }

      return new AssignmentInstructionNode(symTable[varName.val], expression);
    }

    expression(symTable) {
      let left = this.factor(symTable);

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "ADD") {
          this.lexer.consume("ADD");
          const right = this.factor(symTable);
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for addition ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerAddNode(left, right);
        } else if(token.type === "SUB") {
          this.lexer.consume("SUB");
          const right = this.factor(symTable);
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for substraction ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerSubNode(left, right);
        } else {
          break;
        }
      }

      return left;
    }

    factor(symTable) {
      let left = this.term(symTable);

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "MUL") {
          this.lexer.consume("MUL");
          const right = this.term(symTable);
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for multiplication ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerMulNode(left, right);
        } else if(token.type === "DIV") {
          this.lexer.consume("DIV");
          const right = this.term(symTable);
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for division ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerDivNode(left, right);
        } else if(token.type === "and") {
          this.lexer.consume("and");
          const right = this.term(symTable);
          if(left.type !== "Boolean" || right.type !== "Boolean") {
            throw(`Incompatible types for and ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new BooleanAndNode(left, right);
        } else if(token.type === "or") {
          this.lexer.consume("or");
          const right = this.term(symTable);
          if(left.type !== "Boolean" || right.type !== "Boolean") {
            throw(`Incompatible types for and ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new BooleanOrNode(left, right);
        } else {
          break;
        }
      }

      return left;
    }

    term(symTable) {
      const token = this.lexer.nextToken();

      if(token.type === "INTEGER_LITERAL") {
        return new IntegerLiteralNode(parseInt(token.val));
      } else if(token.type === "ADD") {
        const expression = this.expression(symTable);
        if(expression.type !== "Integer") {
          throw(`Incompatible type for unary add ${expression.type} at line ${token.line}, col ${token.col}`);
        }
        return new IntegerUnaryAddNode(expression);
      } else if(token.type === "SUB") {
        const expression = this.expression(symTable);
        if(expression.type !== "Integer") {
          throw(`Incompatible type for unary sub ${expression.type} at line ${token.line}, col ${token.col}`);
        }
        return new IntegerUnarySubNode(expression);
      } else if(token.type === "ID") {
        if(!symTable[token.val]) throw(`Variable ${token.val} doesn't exist! At line ${token.line}, col ${token.col}`);
        return new VariableNode(symTable[token.val]);
      } else if(token.type === "LEFT_PAREN") {
        const expression = this.expression(symTable);
        this.lexer.consume("RIGHT_PAREN");
        return expression;
      } else if(token.type === "true") {
        return new BooleanLiteralNode(true);
      } else if(token.type === "false") {
        return new BooleanLiteralNode(false);
      } else if(token.type === "not") {
        const expression = this.expression(symTable);
        if(expression.type !== "Boolean") {
          throw(`Incompatible type for not ${expression.type} at line ${token.line}, col ${token.col}`);
        }
        return new BooleanNotNode(expression);
      } else {
        throw(`Invalid token ${token.type} at line ${token.line}, col ${token.col}`);
      }
    }
  }

  const KEYWORDS = ["program", "begin", "end", "var", "if", "then", "else", "and", "or", "not", "true", "false"];
  const TYPES = ["Integer", "Boolean"];

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

        if(TYPES.includes(token.val)) {
          token.type = "TYPE";
        } else if(KEYWORDS.includes(token.val)) {
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
      } else if(this.input[this.offset] === ",") {
        token.val = ",";
        this.offset++;
        token.type = "COMMA";
      } else if(this.input[this.offset] === ":") {
        token.val = ":";
        this.offset++;
        token.type = "COLON";
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
      } else if(this.input[this.offset] === "(") {
        token.val = "(";
        this.offset++;
        token.type = "LEFT_PAREN";
      } else if(this.input[this.offset] === ")") {
        token.val = ")";
        this.offset++;
        token.type = "RIGHT_PAREN";
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
