(function() {
  const form = document.getElementById("form");
  const textarea = document.getElementById("code");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const parser = new Parser(textarea.value);
    const ast = parser.parse();
    console.log(ast);

    ast.simulate({});
  });

  class ProgramNode {
    constructor(name, statement) {
      this.name = name;
      this.statement = statement;
    }

    simulate(ctx) {
      this.statement.simulate(ctx);
    }
  }

  class StatementsBlockNode {
    constructor(statements) {
      this.statements = statements;
    }

    simulate(ctx) {
      this.statements.forEach(statement => statement.simulate(ctx));
    }
  }

  class IfStatementNode {
    constructor(condition, ifStatement, elseStatement) {
      this.condition = condition;
      this.ifStatement = ifStatement;
      this.elseStatement = elseStatement;
    }

    simulate(ctx) {
      if(this.condition.simulate(ctx)) {
        this.ifStatement.simulate(ctx);
      } else {
        this.elseStatement.simulate(ctx);
      }
    }
  }

  class WhileStatementNode {
    constructor(condition, statement) {
      this.condition = condition;
      this.statement = statement;
    }

    simulate(ctx) {
      while(this.condition.simulate(ctx)) {
        this.statement.simulate(ctx);
      }
    }
  }

  class WritelnStatementNode {
    constructor(expression) {
      this.expression = expression;
    }

    simulate(ctx) {
      console.log(this.expression.simulate(ctx));
    }
  }

  class AssignmentStatementNode {
    constructor(variable, expression) {
      this.variable = variable;
      this.expression = expression;
    }

    simulate(ctx) {
      ctx[this.variable.name] = this.expression.simulate(ctx);
    }
  }

  class ArrayReadNode {
    constructor(ary, index) {
      this.ary = ary;
      this.index = index;
      this.type = ary.typeSpecs.itemType;
    }

    simulate(ctx) {
      const index = this.index.simulate(ctx);
      return ctx[this.ary.name][index];
    }
  }

  class ArrayWriteNode {
    constructor(ary, index, expression) {
      this.ary = ary;
      this.index = index;
      this.expression = expression;
    }

    simulate(ctx) {
      const index = this.index.simulate(ctx);
      if(!ctx[this.ary.name]) ctx[this.ary.name] = [];
      ctx[this.ary.name][index] = this.expression.simulate(ctx);
    }
  }

  class FunctionCallNode {
    constructor(fun, args) {
      this.fun = fun;
      this.args = args;
      this.type = fun.returnType;
    }

    simulate(ctx) {
      const ctx2 = {};
      for(let i=0; i<this.args.length; i++) {
        ctx2[this.fun.args[i].name] = this.args[i].simulate(ctx);
      }
      this.fun.statement.simulate(ctx2);
      return ctx2["$res$"];
    }
  }

  class NoOpNode {
    simulate(ctx) {
      // well... no-op. surprise!
    }
  }

  class IntegerAddNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) + this.b.simulate(ctx);
    }
  }

  class IntegerSubNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) - this.b.simulate(ctx);
    }
  }

  class IntegerMulNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) * this.b.simulate(ctx);
    }
  }

  class IntegerDivNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate(ctx) {
      return Math.floor(this.a.simulate(ctx) / this.b.simulate(ctx));
    }
  }

  class IntegerModNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Integer";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) % this.b.simulate(ctx);
    }
  }

  class IntegerLiteralNode {
    constructor(integer) {
      this.integer = integer
      this.type = "Integer";
    }

    simulate(ctx) {
      return this.integer;
    }
  }

  class IntegerUnaryAddNode {
    constructor(expression) {
      this.expression = expression
      this.type = "Integer";
    }

    simulate(ctx) {
      return this.expression.simulate(ctx);
    }
  }

  class IntegerUnarySubNode {
    constructor(expression) {
      this.expression = expression
      this.type = "Integer";
    }

    simulate(ctx) {
      return -this.expression.simulate(ctx);
    }
  }

  class RealDivNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Real";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) / this.b.simulate(ctx);
    }
  }

  class EqNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) === this.b.simulate(ctx);
    }
  }

  class LtNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) < this.b.simulate(ctx);
    }
  }

  class GtNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) > this.b.simulate(ctx);
    }
  }

  class LteNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) <= this.b.simulate(ctx);
    }
  }

  class GteNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return this.a.simulate(ctx) >= this.b.simulate(ctx);
    }
  }

  class BooleanLiteralNode {
    constructor(boolean) {
      this.boolean = boolean;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return this.boolean;
    }
  }

  class BooleanAndNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      const a = this.a.simulate(ctx);
      const b = this.b.simulate(ctx);
      return a && b;
    }
  }

  class BooleanOrNode {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.type = "Boolean";
    }

    simulate(ctx) {
      const a = this.a.simulate(ctx);
      const b = this.b.simulate(ctx);
      return a || b;
    }
  }

  class BooleanNotNode {
    constructor(expression) {
      this.expression = expression;
      this.type = "Boolean";
    }

    simulate(ctx) {
      return !this.expression.simulate(ctx);
    }
  }

  class VariableNode {
    constructor(variable) {
      this.variable = variable;
      this.type = this.variable.type;
    }

    simulate(ctx) {
      return ctx[this.variable.name];
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
      this.symTable = {};

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "var") {
          this.varsDeclarations();
        } else if(token.type === "function") {
          this.functionDeclaration();
        } else {
          break
        }
      }

      const statement = this.statementsBlock();
      this.lexer.consume("DOT");
      this.lexer.consume("EOF");

      return new ProgramNode(id.val, statement);
    }

    functionDeclaration() {
      this.lexer.consume("function");
      const id = this.lexer.consume("ID");
      this.lexer.consume("LEFT_PAREN");

      this.symTable = { "$parent$": this.symTable };

      const args = [];

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "ID") {
          const { varNames, type, typeSpecs } = this.varDeclaration();

          varNames.forEach(varName => {
            if(this.symTable[varName.val]) throw(`Variable ${varName.val} already exists! At line ${varName.line}, col ${varName.col}`);

            this.symTable[varName.val] = { name: varName.val, type: type.val, typeSpecs: typeSpecs };
            args.push({ name: varName.val, type: type.val, typeSpecs: typeSpecs });
          });
        } else {
          break;
        }
      }

      this.lexer.consume("RIGHT_PAREN");
      this.lexer.consume("COLON");

      const type = this.lexer.consume("TYPE");

      this.lexer.consume("SEMICOLON");

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "var") {
          this.varsDeclarations();
        } else {
          break
        }
      }

      this.symTable[id.val] = { name: id.val, type: "Function", args: args, returnType: type.val };
      this.symTable["$fun$"] = id.val;
      this.symTable["$res$"] = { name: "$res$", type: type.val };

      const statement = this.statementsBlock();

      this.lexer.consume("SEMICOLON");

      this.symTable[id.val].statement = statement; // backpatch

      this.symTable["$parent$"][id.val] = { name: id.val, type: "Function", args: args, returnType: type.val, statement: statement };

      this.symTable = this.symTable["$parent$"];
    }

    varsDeclarations() {
      const token = this.lexer.peek();
      if(token.type === "var") {
        this.lexer.consume("var");

        while(true) {
          const token = this.lexer.peek();

          if(token.type === "ID") {
            const { varNames, type, typeSpecs } = this.varDeclaration();

            varNames.forEach(varName => {
              if(this.symTable[varName.val]) throw(`Variable ${varName.val} already exists! At line ${varName.line}, col ${varName.col}`);

              this.symTable[varName.val] = { name: varName.val, type: type.val, typeSpecs: typeSpecs };
            });

            this.lexer.consume("SEMICOLON");
          } else {
            break;
          }
        }
      }
    }

    varDeclaration() {
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
      const typeSpecs = {};

      if(type.val === "Array") {
        this.lexer.consume("LEFT_BRACKET");
        const low = this.lexer.consume("INTEGER_LITERAL");
        this.lexer.consume("DOTDOT");
        const high = this.lexer.consume("INTEGER_LITERAL");
        this.lexer.consume("RIGHT_BRACKET");
        this.lexer.consume("of");
        const itemType = this.lexer.consume("TYPE");

        typeSpecs.low = parseInt(low.val);
        typeSpecs.high = parseInt(high.val);
        typeSpecs.itemType = itemType.val;
      }

      return { varNames: varNames, type: type, typeSpecs: typeSpecs };
    }

    statements() {
      const res = [];

      res.push(this.statement());

      while(true) {
        const token = this.lexer.peek();
        if(token.type === "SEMICOLON") {
          this.lexer.consume("SEMICOLON");
          res.push(this.statement());
        } else {
          break;
        }
      }

      return res;
    }

    statement() {
      const token = this.lexer.peek();
      if(token.type === "end") return new NoOpNode();

      if(token.type === "begin") {
        return this.statementsBlock();
      } else if(token.type === "if") {
        return this.ifStatement();
      } else if(token.type === "while") {
        return this.whileStatement();
      } else if(token.type === "writeln") {
        return this.writelnStatement();
      } else {
        return this.assignmentStatement();
      }
    }

    statementsBlock() {
      this.lexer.consume("begin");

      const statements = this.statements();

      this.lexer.consume("end");

      return new StatementsBlockNode(statements);
    }

    ifStatement() {
      const token = this.lexer.consume("if");
      const condition = this.expression();
      if(condition.type !== "Boolean") {
        throw(`Invalid type for if statement, expected Boolean, got ${condition.type} at line ${token.line}, col ${token.col}`);
      }

      this.lexer.consume("then");
      const ifStatement = this.statement();

      this.lexer.consume("else");
      const elseStatement = this.statement();

      return new IfStatementNode(condition, ifStatement, elseStatement);
    }

    whileStatement() {
      const token = this.lexer.consume("while");
      const condition = this.expression();
      if(condition.type !== "Boolean") {
        throw(`Invalid type for while statement, expected Boolean, got ${condition.type} at line ${token.line}, col ${token.col}`);
      }

      this.lexer.consume("do");
      const statement = this.statement();

      return new WhileStatementNode(condition, statement);
    }

    writelnStatement() {
      const token = this.lexer.consume("writeln");
      this.lexer.consume("LEFT_PAREN");
      const expression = this.expression();
      this.lexer.consume("RIGHT_PAREN");

      return new WritelnStatementNode(expression);
    }

    assignmentStatement() {
      const varName = this.lexer.consume("ID");

      const variable = varName.val === this.symTable["$fun$"] ? this.symTable["$res$"] : this.symTable[varName.val];
      if(!variable) throw(`Variable ${varName.val} doesn't exist! At line ${varName.line}, col ${varName.col}`);

      const token = this.lexer.peek();
      if(token.type === "LEFT_BRACKET") {
        this.lexer.consume("LEFT_BRACKET");
        const index = this.expression();
        this.lexer.consume("RIGHT_BRACKET");

        const assign = this.lexer.consume("ASSIGN");
        const expression = this.expression();

        if(variable.typeSpecs.itemType !== expression.type) {
          throw(`Incompatible types ${variable.typeSpecs.itemType} and ${expression.type} at line ${assign.line}, col ${assign.col}`);
        }

        return new ArrayWriteNode(variable, index, expression);
      } else {
        const assign = this.lexer.consume("ASSIGN");
        const expression = this.expression();

        if(variable.type !== expression.type) {
          throw(`Incompatible types ${variable.type} and ${expression.type} at line ${assign.line}, col ${assign.col}`);
        }

        return new AssignmentStatementNode(variable, expression);
      }
    }

    expressions() {
      const res = [];

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "RIGHT_PAREN") break;
        if(token.type === "COMMA") this.lexer.consume("COMMA");

        res.push(this.expression());
      }

      return res;
    }

    expression() {
      let left = this.factor();

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "ADD") {
          this.lexer.consume("ADD");
          const right = this.factor();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for addition ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerAddNode(left, right);
        } else if(token.type === "SUB") {
          this.lexer.consume("SUB");
          const right = this.factor();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for substraction ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerSubNode(left, right);
        } else if(token.type === "EQ") {
          this.lexer.consume("EQ");
          const right = this.factor();
          if(left.type !== right.type) {
            throw(`Incompatible types for eq ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new EqNode(left, right);
        } else if(token.type === "LT") {
          this.lexer.consume("LT");
          const right = this.factor();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for lt ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new LtNode(left, right);
        } else if(token.type === "GT") {
          this.lexer.consume("GT");
          const right = this.factor();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for lt ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new GtNode(left, right);
        } else if(token.type === "LTE") {
          this.lexer.consume("LTE");
          const right = this.factor();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for lte ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new LteNode(left, right);
        } else if(token.type === "GTE") {
          this.lexer.consume("GTE");
          const right = this.factor();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for lte ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new GteNode(left, right);
        } else {
          break;
        }
      }

      return left;
    }

    factor() {
      let left = this.term();

      while(true) {
        const token = this.lexer.peek();

        if(token.type === "MUL") {
          this.lexer.consume("MUL");
          const right = this.term();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for multiplication ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerMulNode(left, right);
        } else if(token.type === "DIV") {
          this.lexer.consume("DIV");
          const right = this.term();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for division ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new RealDivNode(left, right);
        } else if(token.type === "div") {
          this.lexer.consume("div");
          const right = this.term();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for division ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerDivNode(left, right);
        } else if(token.type === "mod") {
          this.lexer.consume("mod");
          const right = this.term();
          if(left.type !== "Integer" || right.type !== "Integer") {
            throw(`Incompatible types for mod ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new IntegerModNode(left, right);
        } else if(token.type === "and") {
          this.lexer.consume("and");
          const right = this.term();
          if(left.type !== "Boolean" || right.type !== "Boolean") {
            throw(`Incompatible types for and ${left.type} and ${right.type} at line ${token.line}, col ${token.col}`);
          }
          left = new BooleanAndNode(left, right);
        } else if(token.type === "or") {
          this.lexer.consume("or");
          const right = this.term();
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

    term() {
      const token = this.lexer.nextToken();

      if(token.type === "INTEGER_LITERAL") {
        return new IntegerLiteralNode(parseInt(token.val));
      } else if(token.type === "ADD") {
        const expression = this.expression();
        if(expression.type !== "Integer") {
          throw(`Incompatible type for unary add ${expression.type} at line ${token.line}, col ${token.col}`);
        }
        return new IntegerUnaryAddNode(expression);
      } else if(token.type === "SUB") {
        const expression = this.expression();
        if(expression.type !== "Integer") {
          throw(`Incompatible type for unary sub ${expression.type} at line ${token.line}, col ${token.col}`);
        }
        return new IntegerUnarySubNode(expression);
      } else if(token.type === "ID") {
        let sym;
        let table = this.symTable;
        while(!sym && table) {
          sym = table[token.val];
          table = table["$parent$"];
        }
        if(!sym) throw(`Variable ${token.val} doesn't exist! At line ${token.line}, col ${token.col}`);
        return this.variableTerm(sym);
      } else if(token.type === "LEFT_PAREN") {
        const expression = this.expression();
        this.lexer.consume("RIGHT_PAREN");
        return expression;
      } else if(token.type === "true") {
        return new BooleanLiteralNode(true);
      } else if(token.type === "false") {
        return new BooleanLiteralNode(false);
      } else if(token.type === "not") {
        const expression = this.expression();
        if(expression.type !== "Boolean") {
          throw(`Incompatible type for not ${expression.type} at line ${token.line}, col ${token.col}`);
        }
        return new BooleanNotNode(expression);
      } else {
        throw(`Invalid token ${token.type} at line ${token.line}, col ${token.col}`);
      }
    }

    variableTerm(sym) {
      const token = this.lexer.peek();

      if(token.type === "LEFT_PAREN") {
        if(sym.type !== "Function") {
          throw(`${sym.name} is not a function at line ${token.line}, col ${token.col}`);
        }
        this.lexer.consume("LEFT_PAREN");
        const args = this.expressions();
        this.lexer.consume("RIGHT_PAREN");
        if(args.length !== sym.args.length) {
          throw(`Invalid number of arguments, expected ${sym.args.length}, got ${args.length} at line ${token.line}, col ${token.col}`);
        }
        for(let i=0; i<args.length; i++) {
          if(args[i].type !== sym.args[i].type) {
            throw(`Invalid type for argument ${i+1}, expected ${sym.args[i].type}, got ${args[i].type} at line ${token.line}, col ${token.col}`);
          }
        }
        return new FunctionCallNode(sym, args);
      } else if(token.type === "LEFT_BRACKET") {
        if(sym.type !== "Array") {
          throw(`${sym.name} is not an array at line ${token.line}, col ${token.col}`);
        }
        this.lexer.consume("LEFT_BRACKET");
        const index = this.expression();
        this.lexer.consume("RIGHT_BRACKET");
        if(index.type !== "Integer") {
          throw(`Invalid type for array index, expected Integer, got ${index.type}`);
        }
        return new ArrayReadNode(sym, index);
      } else {
        return new VariableNode(sym);
      }
    }
  }

  const KEYWORDS = ["program", "begin", "end", "var", "of", "if", "then", "else", "while", "do", "and", "or", "not", "true", "false", "mod", "div", "writeln", "function"];
  const TYPES = ["Integer", "Boolean", "Array"];

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
      } else if(this.offset + 1 < this.input.length && this.input[this.offset] === "." && this.input[this.offset + 1] === ".") {
        token.val = "..";
        this.offset += 2;
        token.type = "DOTDOT";
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
      } else if(this.input[this.offset] === "[") {
        token.val = "[";
        this.offset++;
        token.type = "LEFT_BRACKET";
      } else if(this.input[this.offset] === "]") {
        token.val = "]";
        this.offset++;
        token.type = "RIGHT_BRACKET";
      } else if(this.input[this.offset] === "=") {
        token.val = "=";
        this.offset++;
        token.type = "EQ";
      } else if(this.offset + 1 < this.input.length && this.input[this.offset] === "<" && this.input[this.offset + 1] === "=") {
        token.val = "<=";
        this.offset += 2;
        token.type = "LTE";
      } else if(this.offset + 1 < this.input.length && this.input[this.offset] === ">" && this.input[this.offset + 1] === "=") {
        token.val = ">=";
        this.offset += 2;
        token.type = "GTE";
      } else if(this.input[this.offset] === "<") {
        token.val = "<";
        this.offset++;
        token.type = "LT";
      } else if(this.input[this.offset] === ">") {
        token.val = "<";
        this.offset++;
        token.type = "GT";
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
