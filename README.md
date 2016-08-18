<p align="center">
  <img src="http://media.sigsev.io/samus.jpg" width="200">
</p>

# samus

[![samus](https://nodei.co/npm/samus.png)](https://www.npmjs.com/package/samus)

Samus let you select a file from a basic HTTP website, then launch [mpv](https://mpv.io/) with it.
It was build for personal purposes, but you're welcome!

## Installation

```bash
npm i -g samus
```

## Usage

```bash
  Usage: samus [options] <url>

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    -f, --fullscreen  launch mpv in fullscreen
```

## Configuration

#### the `.samusrc` file

You can create a `.samusrc` file in your `$HOME` directory, to specify default
server / default credentials. Here is an example `.samusrc`:

```json
{
  "defaultServer": {
    "url": "example.com",
    "credentials": {
      "username": "bob",
      "password": "sup3r-s3cr3t"
    }
  }
}
```

Now, you don't have to specify it anymore, just type:

```bash
samus
```
