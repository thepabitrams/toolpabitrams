# zeroperl-ts

Perl 5 compiled to WebAssembly. Run Perl scripts in the browser or other JavaScript environments without installing Perl.

Built on [zeroperl](https://github.com/6over3/zeroperl).

## Features

- Runs Perl 5 in browser, Node.js, Deno, and Bun
- Virtual filesystem for script and data files
- Bidirectional data exchange between JavaScript and Perl
- Register JavaScript functions callable from Perl
- Call Perl functions from JavaScript
- Environment variable support
- Output capture (stdout/stderr)
- TypeScript type definitions included

## Installation

```bash
npm install @6over3/zeroperl-ts
# or
bun add @6over3/zeroperl-ts
```

Or, for [Browser Usage](#browser-usage), copy the zeroperl WASM binary to your local website (to avoid CORS errors).

```bash
# The -L option allows the CDN to redirect to the latest version
curl -L -O https://esm.sh/@6over3/zeroperl-ts/zeroperl.wasm
```

## Quick Start

```typescript
import { ZeroPerl } from '@6over3/zeroperl-ts';

const perl = await ZeroPerl.create();
await perl.eval('print "Hello, World!\\n"');
perl.flush(); // Required to see output
perl.dispose();
```

## Output Buffering

Perl buffers output by default. Choose one approach:

**Option 1: Call `flush()` after printing**
```typescript
await perl.eval('print "Hello!\\n"');
perl.flush();
```

**Option 2: Enable autoflush in Perl**
```typescript
await perl.eval(`
  $| = 1;  # Enable autoflush
  print "Hello!\\n";
`);
```

## Basic Usage

### Evaluating Perl Code

```typescript
import { ZeroPerl } from '@6over3/zeroperl-ts';

const perl = await ZeroPerl.create();

const result = await perl.eval(`
  $| = 1;
  my $x = 42;
  print "The answer is $x\\n";
`);

if (!result.success) {
  console.error('Error:', result.error);
}

perl.dispose();
```

### Capturing Output

```typescript
let output = '';

const perl = await ZeroPerl.create({
  stdout: (data) => {
    output += typeof data === 'string' ? data : new TextDecoder().decode(data);
  }
});

await perl.eval(`
  $| = 1;
  print "Line 1\\n";
  print "Line 2\\n";
`);

console.log(output);
// Output:
// Line 1
// Line 2

perl.dispose();
```

### Exchanging Data

```typescript
const perl = await ZeroPerl.create();

// JavaScript to Perl
perl.setVariable('name', 'Alice');
perl.setVariable('age', 30);

await perl.eval(`
  $| = 1;
  print "Name: $name\\n";
  print "Age: $age\\n";
`);

// Perl to JavaScript
await perl.eval('$result = 2 + 2');
const result = perl.getVariable('result');
console.log(result.toInt()); // 4

result.dispose();
perl.dispose();
```

### Working with Arrays and Hashes

```typescript
const perl = await ZeroPerl.create();

// Create array
const arr = perl.createArray([1, 2, 3, 'hello']);
perl.setVariable('myarray', arr.toValue());

// Create hash
const hash = perl.createHash({
  name: 'Alice',
  age: 30,
  active: true
});
perl.setVariable('user', hash.toValue());

await perl.eval(`
  $| = 1;
  print "Array length: ", scalar(@$myarray), "\\n";
  print "User: $user->{name}, Age: $user->{age}\\n";
`);

// Convert back to JavaScript
const jsArray = arr.project(); // [1, 2, 3, 'hello']
const jsObject = hash.project(); // { name: 'Alice', age: 30, active: true }

arr.dispose();
hash.dispose();
perl.dispose();
```

### Command-Line Arguments

```typescript
const perl = await ZeroPerl.create();

await perl.eval(`
  $| = 1;
  print "Arguments: @ARGV\\n";
  foreach my $arg (@ARGV) {
    print "  $arg\\n";
  }
`, ['foo', 'bar', 'baz']);

perl.dispose();
```

## Working with Files

### Creating a Virtual Filesystem

```typescript
import { ZeroPerl, MemoryFileSystem } from '@6over3/zeroperl-ts';

const fs = new MemoryFileSystem({ "/": "" });

fs.addFile("/data.txt", "Hello from a file!");
fs.addFile("/script.pl", `
  $| = 1;
  open my $fh, '<', '/data.txt' or die $!;
  while (my $line = <$fh>) {
    print "Read: $line";
  }
  close $fh;
`);

const perl = await ZeroPerl.create({ fileSystem: fs });

await perl.runFile('/script.pl');

perl.dispose();
```

### Running Scripts with Arguments

```typescript
const fs = new MemoryFileSystem({ "/": "" });
fs.addFile("/greet.pl", `
  $| = 1;
  my ($name, $greeting) = @ARGV;
  print "$greeting, $name!\\n";
`);

const perl = await ZeroPerl.create({ fileSystem: fs });

await perl.runFile('/greet.pl', ['Alice', 'Hello']);
// Output: Hello, Alice!

perl.dispose();
```

### Reading and Writing Files

```typescript
const fs = new MemoryFileSystem({ "/": "" });

const perl = await ZeroPerl.create({ fileSystem: fs });

// Write from Perl
await perl.eval(`
  $| = 1;
  open my $fh, '>', '/output.txt' or die $!;
  print $fh "Generated content\\n";
  close $fh;
  print "File written!\\n";
`);

// Read from JavaScript
const content = fs.readFile('/output.txt');
console.log(content); // "Generated content\n"

perl.dispose();
```

## Advanced Usage

### Registering JavaScript Functions

Register JavaScript functions that can be called from Perl:

```typescript
const perl = await ZeroPerl.create();

perl.registerFunction('add', (a, b) => {
  const x = a.toInt();
  const y = b.toInt();
  return perl.createInt(x + y);
});

await perl.eval(`
  $| = 1;
  my $sum = add(10, 32);
  print "Sum: $sum\\n";
`);

perl.dispose();
```

### Registering JavaScript Methods

```typescript
const perl = await ZeroPerl.create();

perl.registerMethod('Math', 'square', (x) => {
  const num = x.toInt();
  return perl.createInt(num * num);
});

await perl.eval(`
  $| = 1;
  my $result = Math::square(7);
  print "Square: $result\\n";
`);

perl.dispose();
```

### Calling Perl Functions from JavaScript

```typescript
const perl = await ZeroPerl.create();

await perl.eval(`
  sub greet {
    my ($name) = @_;
    return "Hello, $name!";
  }

  sub get_values {
    return (1, 2, 3);
  }
`);

// Scalar context (single return value)
const arg = perl.createString("Alice");
const greeting = await perl.call("greet", [arg], "scalar");
console.log(greeting?.toString()); // "Hello, Alice!"

// List context (multiple return values)
const values = await perl.call("get_values", [], "list");
console.log(values.map(v => v.toInt())); // [1, 2, 3]

// Void context (no return value)
await perl.call("some_sub", [], "void");

arg.dispose();
greeting?.dispose();
for (const v of values) v.dispose();
perl.dispose();
```

### Error Handling

```typescript
const perl = await ZeroPerl.create();

const result = await perl.eval(`
  die "Something went wrong!";
`);

if (!result.success) {
  console.log('Exit code:', result.exitCode);
  console.log('Error:', result.error);
}

// Get error directly
const error = perl.getLastError();
console.log(error); // "Something went wrong! at ..."

// Clear error
perl.clearError();

perl.dispose();
```

### Environment Variables

```typescript
const perl = await ZeroPerl.create({
  env: {
    API_KEY: 'secret123',
    DEBUG: 'true'
  }
});

await perl.eval(`
  $| = 1;
  print "API Key: $ENV{API_KEY}\\n";
  print "Debug: $ENV{DEBUG}\\n";
`);

perl.dispose();
```

### Resetting State

```typescript
const perl = await ZeroPerl.create();

await perl.eval('$counter = 1');
const val1 = perl.getVariable('counter');
console.log(val1?.toInt()); // 1

await perl.reset();

const val2 = perl.getVariable('counter');
console.log(val2); // null

val1?.dispose();
perl.dispose();
```

### Progressive Output

```typescript
const perl = await ZeroPerl.create({
  stdout: (data) => process.stdout.write(data)
});

for (let i = 0; i < 5; i++) {
  await perl.eval('print "."');
  perl.flush();
  await new Promise(r => setTimeout(r, 500));
}

perl.dispose();
```

## Browser Usage

**With bundler (recommended):**

```typescript
import { ZeroPerl } from '@6over3/zeroperl-ts';
import zeroperl from '@6over3/zeroperl-ts/zeroperl.wasm';

const perl = await ZeroPerl.create({
  fetch: () => fetch(zeroperl),
  stdout: (data) => console.log(data)
});

await perl.eval(`
  $| = 1;
  print "Hello from Perl!\\n";
  print "Running in: $^O\\n";
`);

perl.dispose();
```

Note: Most bundlers should copy the WASM file when imported explicitly. If your bundler doesn't handle this, configure it to copy static assets or use the CDN approach below.

**From CDN:**

```html
<!DOCTYPE html>
<html>
<body>
  <div id="output"></div>
  
  <script type="module">
    import { ZeroPerl } from 'https://esm.sh/@6over3/zeroperl-ts';
    
    const output = document.getElementById('output');
    
    const perl = await ZeroPerl.create({
      stdout: (data) => {
        const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
        output.innerHTML += text.replace(/\n/g, '<br>');
      }
    });
    
    await perl.eval(`
      $| = 1;
      print "Hello from Perl!\\n";
      print "Running in: $^O\\n";
    `);

    perl.dispose();
  </script>
</body>
</html>
```

## API Reference

### `ZeroPerl.create(options?)`

Create a new Perl interpreter instance.

**Options:**
- `env` - Environment variables (Record<string, string>)
- `fileSystem` - Virtual filesystem (MemoryFileSystem)
- `stdout` - stdout callback ((data: string | Uint8Array) => void)
- `stderr` - stderr callback ((data: string | Uint8Array) => void)
- `fetch` - Custom fetch for WASM loading

```typescript
const perl = await ZeroPerl.create({
  env: { KEY: 'value' },
  fileSystem: fs,
  stdout: (data) => console.log(data),
  stderr: (data) => console.error(data)
});
```

### `perl.eval(code, args?)`

Evaluate Perl code. Returns `{ success: boolean, error?: string, exitCode: number }`.

```typescript
const result = await perl.eval('print "Hello\\n"', ['arg1', 'arg2']);
```

### `perl.runFile(path, args?)`

Run a Perl script from the virtual filesystem.

```typescript
await perl.runFile('/script.pl', ['arg1', 'arg2']);
```

### `perl.createInt(value)`, `perl.createDouble(value)`, `perl.createString(value)`, `perl.createBool(value)`, `perl.createUndef()`

Create Perl values. Returns `PerlValue`.

```typescript
const num = perl.createInt(42);
const str = perl.createString("hello");
const bool = perl.createBool(true);
```

### `perl.createArray(values?)`, `perl.createHash(object?)`

Create Perl arrays and hashes. Returns `PerlArray` or `PerlHash`.

```typescript
const arr = perl.createArray([1, 2, 3]);
const hash = perl.createHash({ key: 'value' });
```

### `perl.toPerlValue(value)`

Convert JavaScript value to Perl. Handles primitives, arrays, and objects.

```typescript
const perlVal = perl.toPerlValue({ name: 'Alice', age: 30 });
```

### `perl.setVariable(name, value)`, `perl.getVariable(name)`

Set and get scalar variables. Variable names should not include the `$` prefix.

```typescript
perl.setVariable('x', 42);
const x = perl.getVariable('x');
console.log(x?.toInt()); // 42
```

### `perl.getArrayVariable(name)`, `perl.getHashVariable(name)`

Get array and hash variables. Returns `PerlArray` or `PerlHash`.

```typescript
const arr = perl.getArrayVariable('myarray');
const hash = perl.getHashVariable('myhash');
```

### `perl.registerFunction(name, fn)`

Register a JavaScript function callable from Perl.

```typescript
perl.registerFunction('add', (a, b) => {
  const x = a.toInt();
  const y = b.toInt();
  return perl.createInt(x + y);
});
```

### `perl.registerMethod(packageName, methodName, fn)`

Register a JavaScript method callable from Perl.

```typescript
perl.registerMethod('Math', 'square', (x) => {
  const num = x.toInt();
  return perl.createInt(num * num);
});
```

### `perl.call(name, args, context?)`

Call a Perl function. Context can be `"void"`, `"scalar"`, or `"list"`.

```typescript
const result = await perl.call('my_sub', [arg1, arg2], 'scalar');
const results = await perl.call('my_sub', [], 'list');
await perl.call('my_sub', [], 'void');
```

### `perl.flush()`

Flush output buffers. Required if autoflush (`$| = 1`) is not set.

```typescript
await perl.eval('print "text"');
perl.flush();
```

### `perl.reset()`

Reset interpreter to clean state. Clears all variables.

```typescript
await perl.reset();
```

### `perl.getLastError()`, `perl.clearError()`

Get and clear the Perl error state (`$@`).

```typescript
const error = perl.getLastError();
perl.clearError();
```

### `perl.isInitialized()`, `perl.canEvaluate()`

Check interpreter state.

```typescript
const ready = perl.isInitialized() && perl.canEvaluate();
```

### `perl.dispose()`, `perl.shutdown()`

Free resources. Use `dispose()` for normal cleanup, `shutdown()` for complete termination.

```typescript
perl.dispose();
// or
perl.shutdown();
```

### PerlValue Methods

- `toInt()` - Convert to 32-bit integer
- `toDouble()` - Convert to double-precision float
- `toString()` - Convert to UTF-8 string
- `toBoolean()` - Convert to boolean (Perl truth test)
- `isUndef()` - Check if undefined
- `isRef()` - Check if reference
- `getType()` - Get Perl type
- `project()` - Convert to JavaScript primitive
- `createRef()` - Create reference
- `deref()` - Dereference value
- `dispose()` - Free memory

### PerlArray Methods

- `push(value)` - Add to end
- `pop()` - Remove from end
- `get(index)` - Get value at index
- `set(index, value)` - Set value at index
- `getLength()` - Get array length
- `clear()` - Remove all elements
- `toValue()` - Convert to PerlValue (array reference)
- `project()` - Convert to JavaScript array
- `[Symbol.iterator]()` - Iterate over values
- `dispose()` - Free memory

### PerlHash Methods

- `set(key, value)` - Set key-value pair
- `get(key)` - Get value by key
- `has(key)` - Check if key exists
- `delete(key)` - Delete key
- `clear()` - Remove all entries
- `toValue()` - Convert to PerlValue (hash reference)
- `project()` - Convert to JavaScript object
- `entries()` - Iterate over key-value pairs
- `keys()` - Iterate over keys
- `values()` - Iterate over values
- `dispose()` - Free memory

## Examples

### Processing JSON

```typescript
import { ZeroPerl, MemoryFileSystem } from '@6over3/zeroperl-ts';

const fs = new MemoryFileSystem({ "/": "" });
fs.addFile("/data.json", JSON.stringify({ users: ['Alice', 'Bob'] }));
fs.addFile("/process.pl", `
  $| = 1;
  use strict;
  use warnings;
  
  open my $fh, '<', '/data.json' or die $!;
  my $json = do { local $/; <$fh> };
  close $fh;
  
  print "Processing: $json\\n";
`);

const perl = await ZeroPerl.create({ fileSystem: fs });
await perl.runFile('/process.pl');
perl.dispose();
```

### Interactive REPL

```typescript
const perl = await ZeroPerl.create({
  stdout: (data) => console.log(data)
});

await perl.eval('$| = 1');

await perl.eval('$x = 10');
await perl.eval('print "$x\\n"');
await perl.eval('$x *= 2');
await perl.eval('print "$x\\n"');

perl.dispose();
```

### Complex Data Structures

```typescript
const perl = await ZeroPerl.create();

perl.setVariable('config', {
  server: {
    host: 'localhost',
    port: 8080
  },
  features: ['auth', 'logging']
});

await perl.eval(`
  $| = 1;
  print "Host: $config->{server}{host}\\n";
  print "Port: $config->{server}{port}\\n";
  print "Features: @{$config->{features}}\\n";
`);

perl.dispose();
```

## Development

```bash
npm i              # Install dependencies
bun run build      # Build distributions
bun test           # Run tests
```

## License

Apache-2.0

## About

ZeroPerl compiles Perl 5 to WebAssembly using a WASI-compliant implementation. This package provides a TypeScript/JavaScript API for the [ZeroPerl](https://github.com/6over3/zeroperl) WASM module.