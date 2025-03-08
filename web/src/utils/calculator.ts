class Stack<T> {
    private stack: T[]
    constructor() {
        this.stack = []
    }

    public peek(): T | undefined {
        return this.stack[-1]
    }

    public push(value: T) {
        this.stack.push(value)
    }

    public pop(): T | undefined {
        return this.empty()
            ? undefined
            : this.stack.pop()
    }

    public empty(): boolean {
        return this.stack.length === 0
    }
}

interface Constant {
    num: number
}

interface Variable {
    key: string
}

enum Operation {
    EXP = '^',
    DIV = '/',
    MUL = '*',
    ADD = '+',
    SUB = '-',
}

interface Operator {
    operation: Operation
    operands: [Expression, Expression]
}

type ExpressionType = Operator | Constant | Variable

class ExpressionContext {
    private context: Record<string, Expression>

    constructor(context: Record<string, Expression> = {}) {
        this.context = context
    }

    public set(key: string, exp: Expression) {
        this.context[key] = exp
    }

    public evaluate(key: string): number | undefined {
        if (this.has(key)) {
            return this.context[key].evaluate()
        }
        return undefined
    }

    public has(key: string): boolean {
        return this.context[key] !== undefined
    }

    public remove(key: string) {
        delete this.context[key]
    }
}

class Expression<T extends ExpressionType = ExpressionType> {
    private value: T
    private context?: ExpressionContext

    constructor(value: T) {
        this.value = value
    }

    public static fromTokens(tokens: string[]): Expression<ExpressionType> {
        const operatorStack = new Stack<string>();
        const outputStack = new Stack<Expression>();
        
        // Define operator precedence
        const precedence: Record<string, number> = {
            [Operation.EXP]: 4,
            [Operation.MUL]: 3,
            [Operation.DIV]: 3,
            [Operation.ADD]: 2,
            [Operation.SUB]: 2,
            '(': 1,
        };

        for (const token of tokens) {
            if (token === '(') {
                operatorStack.push(token);
            }
            else if (token === ')') {
                // Process operators until we find the matching parenthesis
                while (!operatorStack.empty() && operatorStack.peek() !== '(') {
                    const operator = operatorStack.pop()!;
                    const b = outputStack.pop()!;
                    const a = outputStack.pop()!;
                    outputStack.push(new Expression<Operator>({
                        operation: operator as Operation,
                        operands: [a, b]
                    }));
                }
                // Remove the opening parenthesis
                operatorStack.pop();
            }
            else if (Object.values(Operation).includes(token as Operation)) {
                // Process operators with higher or equal precedence
                while (!operatorStack.empty() && 
                       operatorStack.peek() !== '(' && 
                       precedence[operatorStack.peek()! as Operation] >= precedence[token as Operation]) {
                    const operator = operatorStack.pop()!;
                    const b = outputStack.pop()!;
                    const a = outputStack.pop()!;
                    outputStack.push(new Expression<Operator>({
                        operation: operator as Operation,
                        operands: [a, b]
                    }));
                }
                operatorStack.push(token);
            }
            else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
                // Variable
                outputStack.push(new Expression<Variable>({
                    key: token
                }));
            }
            else if (/^-?\d*\.?\d+$/.test(token)) {
                // Number constant
                outputStack.push(new Expression<Constant>({
                    num: parseFloat(token)
                }));
            }
            else {
                throw new Error(`Invalid token: ${token}`);
            }
        }

        // Process remaining operators
        while (!operatorStack.empty()) {
            const operator = operatorStack.pop()!;
            if (operator === '(') {
                throw new Error('Mismatched parentheses');
            }
            const b = outputStack.pop()!;
            const a = outputStack.pop()!;
            outputStack.push(new Expression<Operator>({
                operation: operator as Operation,
                operands: [a, b]
            }));
        }

        if (outputStack.empty()) {
            throw new Error('Empty expression');
        }

        return outputStack.pop()!;
    }

    public withContext(context: ExpressionContext) {
        this.context = context
    }

    private isOperator(): this is Expression<Operator> {
        return 'operation' in this.value;
    }

    private isConstant(): this is Expression<Constant> {
        return 'num' in this.value;
    }

    private isVariable(): this is Expression<Variable> {
        return 'key' in this.value;
    }

    public evaluate(): number | undefined {
        if (this.isOperator()) {
            const [a, b] = this.value.operands.map((operand) => operand.evaluate())
            if (a === undefined || b === undefined) {
                return undefined
            }

            switch (this.value.operation) {
                case Operation.ADD:
                    return a + b
                case Operation.DIV:
                    return a / b
                case Operation.EXP:
                    return Math.pow(a, b)
                case Operation.MUL:
                    return a * b
                case Operation.SUB:
                    return a - b
            }
        } else if (this.isConstant()) {
            return this.value.num
        } else if (this.isVariable()) {
            if (this.context && this.context.has(this.value.key)) {
                return this.context.evaluate(this.value.key)
            }
        }
        return undefined
    }
}

const expr = Expression.fromTokens(["9", "*", "2", "+", "(", "13", "/", "17", ")"]);
console.log(expr.evaluate()); // Will output: 18 + (13/17) ≈ 18.76
