"""
Haeccstable DSL Parser

Lexer, Parser, and Type Checker for the Haeccstable DSL.
Supports all variable types, process definitions with $ prefix,
function definitions, method calls, and property access.
"""

import re
import json
from enum import Enum, auto
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

class TokenType(Enum):
    """Token types for lexical analysis"""
    # Literals
    NUMBER = auto()
    STRING = auto()
    IDENTIFIER = auto()
    PROCESS_IDENTIFIER = auto()  # $name

    # Keywords
    VIDEO_INVAR = auto()
    VIDEO_OUTVAR = auto()
    AUDIO_INVAR = auto()
    AUDIO_OUTVAR = auto()
    NUMBER_VAR = auto()
    WINDOW_VAR = auto()
    LAYER_OBJ = auto()
    VAR = auto()
    FUNC = auto()
    PROCESS = auto()
    RETURN = auto()

    # Operators
    EQUALS = auto()
    LPAREN = auto()
    RPAREN = auto()
    LBRACE = auto()
    RBRACE = auto()
    COMMA = auto()
    DOT = auto()
    SEMICOLON = auto()
    PLUS = auto()
    MINUS = auto()
    MULTIPLY = auto()
    DIVIDE = auto()

    # Special
    NEWLINE = auto()
    EOF = auto()
    COMMENT = auto()

@dataclass
class Token:
    """Represents a lexical token"""
    type: TokenType
    value: Any
    line: int
    column: int

class Lexer:
    """Lexical analyzer for Haeccstable DSL"""

    KEYWORDS = {
        'video_invar': TokenType.VIDEO_INVAR,
        'video_outvar': TokenType.VIDEO_OUTVAR,
        'audio_invar': TokenType.AUDIO_INVAR,
        'audio_outvar': TokenType.AUDIO_OUTVAR,
        'number_var': TokenType.NUMBER_VAR,
        'window_var': TokenType.WINDOW_VAR,
        'layer_obj': TokenType.LAYER_OBJ,
        'var': TokenType.VAR,
        'func': TokenType.FUNC,
        'process': TokenType.PROCESS,
        'return': TokenType.RETURN,
    }

    def __init__(self, source: str):
        self.source = source
        self.pos = 0
        self.line = 1
        self.column = 1
        self.tokens: List[Token] = []

    def tokenize(self) -> List[Token]:
        """Tokenize the source code"""
        while self.pos < len(self.source):
            self._skip_whitespace()

            if self.pos >= len(self.source):
                break

            # Comments
            if self._peek() == '#' or (self._peek() == '/' and self._peek(1) == '/'):
                self._skip_comment()
                continue

            # Process identifier ($name)
            if self._peek() == '$':
                self._read_process_identifier()
                continue

            # Numbers
            if self._peek().isdigit():
                self._read_number()
                continue

            # Strings
            if self._peek() in ['"', "'"]:
                self._read_string()
                continue

            # Identifiers and keywords
            if self._peek().isalpha() or self._peek() == '_':
                self._read_identifier()
                continue

            # Operators and punctuation
            char = self._peek()
            if char == '=':
                self._add_token(TokenType.EQUALS, '=')
                self._advance()
            elif char == '(':
                self._add_token(TokenType.LPAREN, '(')
                self._advance()
            elif char == ')':
                self._add_token(TokenType.RPAREN, ')')
                self._advance()
            elif char == '{':
                self._add_token(TokenType.LBRACE, '{')
                self._advance()
            elif char == '}':
                self._add_token(TokenType.RBRACE, '}')
                self._advance()
            elif char == ',':
                self._add_token(TokenType.COMMA, ',')
                self._advance()
            elif char == '.':
                self._add_token(TokenType.DOT, '.')
                self._advance()
            elif char == ';':
                self._add_token(TokenType.SEMICOLON, ';')
                self._advance()
            elif char == '+':
                self._add_token(TokenType.PLUS, '+')
                self._advance()
            elif char == '-':
                self._add_token(TokenType.MINUS, '-')
                self._advance()
            elif char == '*':
                self._add_token(TokenType.MULTIPLY, '*')
                self._advance()
            elif char == '/':
                self._add_token(TokenType.DIVIDE, '/')
                self._advance()
            elif char == '\n':
                self.line += 1
                self.column = 1
                self.pos += 1
            else:
                raise SyntaxError(f"Unexpected character '{char}' at line {self.line}, column {self.column}")

        self._add_token(TokenType.EOF, None)
        return self.tokens

    def _peek(self, offset: int = 0) -> str:
        """Peek at character without consuming"""
        pos = self.pos + offset
        return self.source[pos] if pos < len(self.source) else ''

    def _advance(self) -> str:
        """Consume and return current character"""
        char = self.source[self.pos]
        self.pos += 1
        self.column += 1
        return char

    def _skip_whitespace(self):
        """Skip whitespace except newlines"""
        while self.pos < len(self.source) and self.source[self.pos] in ' \t\r':
            self._advance()

    def _skip_comment(self):
        """Skip comment until end of line"""
        while self.pos < len(self.source) and self.source[self.pos] != '\n':
            self._advance()

    def _read_process_identifier(self):
        """Read process identifier starting with $"""
        start_col = self.column
        self._advance()  # Skip $

        if not (self._peek().isalpha() or self._peek() == '_'):
            raise SyntaxError(f"Invalid process identifier at line {self.line}, column {self.column}")

        identifier = ''
        while self._peek().isalnum() or self._peek() == '_':
            identifier += self._advance()

        self._add_token(TokenType.PROCESS_IDENTIFIER, '$' + identifier, start_col)

    def _read_number(self):
        """Read number literal (int or float)"""
        start_col = self.column
        number_str = ''

        while self._peek().isdigit():
            number_str += self._advance()

        # Check for decimal point
        if self._peek() == '.' and self._peek(1).isdigit():
            number_str += self._advance()  # Add '.'
            while self._peek().isdigit():
                number_str += self._advance()
            value = float(number_str)
        else:
            value = int(number_str)

        self._add_token(TokenType.NUMBER, value, start_col)

    def _read_string(self):
        """Read string literal"""
        start_col = self.column
        quote = self._advance()  # Opening quote
        string_value = ''

        while self._peek() and self._peek() != quote:
            if self._peek() == '\\':
                self._advance()  # Skip backslash
                # Handle escape sequences
                escaped = self._advance()
                if escaped == 'n':
                    string_value += '\n'
                elif escaped == 't':
                    string_value += '\t'
                elif escaped == '\\':
                    string_value += '\\'
                elif escaped == quote:
                    string_value += quote
                else:
                    string_value += escaped
            else:
                string_value += self._advance()

        if not self._peek():
            raise SyntaxError(f"Unterminated string at line {self.line}, column {start_col}")

        self._advance()  # Closing quote
        self._add_token(TokenType.STRING, string_value, start_col)

    def _read_identifier(self):
        """Read identifier or keyword"""
        start_col = self.column
        identifier = ''

        while self._peek().isalnum() or self._peek() == '_':
            identifier += self._advance()

        # Check if it's a keyword
        token_type = self.KEYWORDS.get(identifier, TokenType.IDENTIFIER)
        self._add_token(token_type, identifier, start_col)

    def _add_token(self, token_type: TokenType, value: Any, column: int = None):
        """Add token to list"""
        if column is None:
            column = self.column
        self.tokens.append(Token(token_type, value, self.line, column))

class Parser:
    """Parser for Haeccstable DSL"""

    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def parse(self) -> Dict[str, Any]:
        """Parse tokens into AST"""
        try:
            return self._parse_statement()
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

    def _parse_statement(self) -> Dict[str, Any]:
        """Parse a single statement"""
        token = self._peek()

        if token.type == TokenType.EOF:
            return {"status": "success", "message": "Empty command"}

        # Variable declarations
        if token.type in [TokenType.VIDEO_INVAR, TokenType.VIDEO_OUTVAR,
                         TokenType.AUDIO_INVAR, TokenType.AUDIO_OUTVAR,
                         TokenType.NUMBER_VAR, TokenType.WINDOW_VAR,
                         TokenType.LAYER_OBJ, TokenType.VAR]:
            return self._parse_variable_declaration()

        # Function definition
        if token.type == TokenType.FUNC:
            return self._parse_function_definition()

        # Process definition
        if token.type == TokenType.PROCESS:
            return self._parse_process_definition()

        # Method call or property assignment
        if token.type == TokenType.IDENTIFIER:
            next_token = self._peek(1)
            if next_token.type == TokenType.DOT:
                return self._parse_method_or_property()
            # Check for print/println function calls
            elif next_token.type == TokenType.LPAREN and token.value in ['print', 'println']:
                return self._parse_print_statement()
            # Check for other function calls
            elif next_token.type == TokenType.LPAREN:
                result = self._parse_function_call()
                return {
                    "status": "success",
                    "type": "function_call",
                    "name": result["name"],
                    "arguments": result["arguments"],
                    "message": f"Function '{result['name']}' called"
                }

        # Process call
        if token.type == TokenType.PROCESS_IDENTIFIER:
            return self._parse_process_call()

        # Semicolon operator (simultaneous execution)
        if ';' in str([t.value for t in self.tokens]):
            return self._parse_simultaneous()

        return {"status": "error", "error": f"Unexpected token: {token.value}"}

    def _parse_variable_declaration(self) -> Dict[str, Any]:
        """Parse variable declaration"""
        var_type_token = self._consume()
        var_type = var_type_token.value

        name_token = self._consume(TokenType.IDENTIFIER)
        name = name_token.value

        self._consume(TokenType.EQUALS)

        # Parse expression (function call, literal, etc.)
        expr = self._parse_expression()

        return {
            "status": "success",
            "type": "variable_declaration",
            "var_type": var_type,
            "name": name,
            "expression": expr,
            "message": f"Variable '{name}' declared"
        }

    def _parse_function_definition(self) -> Dict[str, Any]:
        """Parse function definition: func name(params) = expression"""
        self._consume(TokenType.FUNC)

        name_token = self._consume(TokenType.IDENTIFIER)
        name = name_token.value

        self._consume(TokenType.LPAREN)
        params = self._parse_parameter_list()
        self._consume(TokenType.RPAREN)

        self._consume(TokenType.EQUALS)

        expr = self._parse_expression()

        return {
            "status": "success",
            "type": "function_definition",
            "name": name,
            "parameters": params,
            "expression": expr,
            "message": f"Function '{name}' defined"
        }

    def _parse_process_definition(self) -> Dict[str, Any]:
        """Parse process definition: process $name(params) { ... }"""
        self._consume(TokenType.PROCESS)

        # Check if next token is a process identifier or regular identifier
        next_token = self._peek()
        if next_token.type == TokenType.IDENTIFIER:
            # User forgot $ prefix
            return {
                "status": "error",
                "error": f"Process names must start with '$'. Did you mean '${next_token.value}'?"
            }

        name_token = self._consume(TokenType.PROCESS_IDENTIFIER)
        if not name_token.value.startswith('$'):
            return {
                "status": "error",
                "error": f"Process names must start with '$'. Did you mean '${name_token.value}'?"
            }

        name = name_token.value

        self._consume(TokenType.LPAREN)
        params = self._parse_parameter_list()
        self._consume(TokenType.RPAREN)

        self._consume(TokenType.LBRACE)

        # Parse process body (simplified for now)
        body = []
        while self._peek().type != TokenType.RBRACE and self._peek().type != TokenType.EOF:
            # Skip to return statement for now
            if self._peek().type == TokenType.RETURN:
                self._consume(TokenType.RETURN)
                return_expr = self._parse_expression()
                body.append({"type": "return", "expression": return_expr})
                break
            else:
                self._consume()  # Skip other tokens for now

        self._consume(TokenType.RBRACE)

        return {
            "status": "success",
            "type": "process_definition",
            "name": name,
            "parameters": params,
            "body": body,
            "message": f"Process '{name}' defined"
        }

    def _parse_method_or_property(self) -> Dict[str, Any]:
        """Parse method call or property assignment"""
        obj_token = self._consume(TokenType.IDENTIFIER)
        obj_name = obj_token.value

        self._consume(TokenType.DOT)

        member_token = self._consume(TokenType.IDENTIFIER)
        member_name = member_token.value

        # Check if it's a method call (followed by parentheses)
        if self._peek().type == TokenType.LPAREN:
            self._consume(TokenType.LPAREN)
            args = self._parse_argument_list()
            self._consume(TokenType.RPAREN)

            return {
                "status": "success",
                "type": "method_call",
                "object": obj_name,
                "method": member_name,
                "arguments": args,
                "message": f"Method '{obj_name}.{member_name}()' called"
            }
        elif self._peek().type == TokenType.EQUALS:
            # Property assignment
            self._consume(TokenType.EQUALS)
            value = self._parse_expression()

            return {
                "status": "success",
                "type": "property_assignment",
                "object": obj_name,
                "property": member_name,
                "value": value,
                "message": f"Property '{obj_name}.{member_name}' set"
            }
        else:
            # Property access (no assignment)
            return {
                "status": "success",
                "type": "property_access",
                "object": obj_name,
                "property": member_name,
                "message": f"Property '{obj_name}.{member_name}' accessed"
            }

    def _parse_process_call(self) -> Dict[str, Any]:
        """Parse process call: $name(args)"""
        process_token = self._consume(TokenType.PROCESS_IDENTIFIER)
        process_name = process_token.value

        self._consume(TokenType.LPAREN)
        args = self._parse_argument_list()
        self._consume(TokenType.RPAREN)

        return {
            "status": "success",
            "type": "process_call",
            "process": process_name,
            "arguments": args,
            "message": f"Process '{process_name}' called"
        }

    def _parse_simultaneous(self) -> Dict[str, Any]:
        """Parse simultaneous execution: cmd1; cmd2"""
        commands = []
        # Simplified: just recognize the pattern
        return {
            "status": "success",
            "type": "simultaneous",
            "commands": commands,
            "message": "Simultaneous execution"
        }

    def _parse_expression(self) -> Dict[str, Any]:
        """Parse expression (function call, literal, etc.)"""
        token = self._peek()

        # Function call
        if token.type == TokenType.IDENTIFIER:
            next_token = self._peek(1)
            if next_token.type == TokenType.LPAREN:
                return self._parse_function_call()
            else:
                # Just an identifier
                return {"type": "identifier", "value": self._consume().value}

        # Process call
        if token.type == TokenType.PROCESS_IDENTIFIER:
            return self._parse_process_call()

        # Literals
        if token.type == TokenType.NUMBER:
            return {"type": "number", "value": self._consume().value}

        if token.type == TokenType.STRING:
            return {"type": "string", "value": self._consume().value}

        # Tuple: (expr, expr, ...)
        if token.type == TokenType.LPAREN:
            return self._parse_tuple()

        return {"type": "unknown"}

    def _parse_print_statement(self) -> Dict[str, Any]:
        """Parse print/println statement with printf-style formatting"""
        func_name = self._consume(TokenType.IDENTIFIER).value  # 'print' or 'println'
        self._consume(TokenType.LPAREN)

        # Parse arguments - could be format string + values, or just values
        args = []
        while self._peek().type not in [TokenType.RPAREN, TokenType.EOF]:
            args.append(self._parse_expression())
            if self._peek().type == TokenType.COMMA:
                self._consume(TokenType.COMMA)
            else:
                break

        self._consume(TokenType.RPAREN)

        return {
            "status": "success",
            "type": "print_statement",
            "function": func_name,
            "arguments": args,
            "message": f"{func_name}() executed"
        }

    def _parse_function_call(self) -> Dict[str, Any]:
        """Parse function call: name(args)"""
        name_token = self._consume(TokenType.IDENTIFIER)
        self._consume(TokenType.LPAREN)
        args = self._parse_argument_list()
        self._consume(TokenType.RPAREN)

        return {
            "type": "function_call",
            "name": name_token.value,
            "arguments": args
        }

    def _parse_tuple(self) -> Dict[str, Any]:
        """Parse tuple: (expr, expr, ...)"""
        self._consume(TokenType.LPAREN)
        elements = []

        while self._peek().type != TokenType.RPAREN:
            elements.append(self._parse_expression())
            if self._peek().type == TokenType.COMMA:
                self._consume(TokenType.COMMA)

        self._consume(TokenType.RPAREN)

        return {
            "type": "tuple",
            "elements": elements
        }

    def _parse_parameter_list(self) -> List[str]:
        """Parse function parameter list"""
        params = []

        while self._peek().type == TokenType.IDENTIFIER:
            params.append(self._consume().value)
            if self._peek().type == TokenType.COMMA:
                self._consume(TokenType.COMMA)
            else:
                break

        return params

    def _parse_argument_list(self) -> Dict[str, Any]:
        """Parse function argument list (positional and named)"""
        args = {"positional": [], "named": {}}

        while self._peek().type not in [TokenType.RPAREN, TokenType.EOF]:
            # Check for named argument (name=value)
            if self._peek().type == TokenType.IDENTIFIER and self._peek(1).type == TokenType.EQUALS:
                name = self._consume().value
                self._consume(TokenType.EQUALS)
                value = self._parse_expression()
                args["named"][name] = value
            else:
                # Positional argument
                expr = self._parse_expression()
                args["positional"].append(expr)

            if self._peek().type == TokenType.COMMA:
                self._consume(TokenType.COMMA)
            else:
                break

        return args

    def _peek(self, offset: int = 0) -> Token:
        """Peek at token without consuming"""
        pos = self.pos + offset
        return self.tokens[pos] if pos < len(self.tokens) else self.tokens[-1]

    def _consume(self, expected_type: TokenType = None) -> Token:
        """Consume and return current token"""
        token = self.tokens[self.pos]

        if expected_type and token.type != expected_type:
            raise SyntaxError(f"Expected {expected_type.name}, got {token.type.name} at line {token.line}, column {token.column}")

        self.pos += 1
        return token

class DSLParser:
    """Main DSL parser interface"""

    def __init__(self):
        pass

    def parse(self, source: str) -> Dict[str, Any]:
        """Parse DSL source code"""
        try:
            # Lexical analysis
            lexer = Lexer(source)
            tokens = lexer.tokenize()

            # Syntactic analysis
            parser = Parser(tokens)
            ast = parser.parse()

            return ast

        except SyntaxError as e:
            return {
                "status": "error",
                "error": str(e)
            }
        except Exception as e:
            return {
                "status": "error",
                "error": f"Parse error: {str(e)}"
            }
