# samus [![build](https://img.shields.io/travis/meriadec/samus.svg?style=flat-square)](https://travis-ci.org/meriadec/samus)

Samus let you select a file from a basic HTTP website, then launch [mpv](https://mpv.io/) with it.
It was build for personal purposes, but you are welcome!

## Installation

    npm i -g samus

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

You can create a `.samusrc` file in your `$HOME` directory, to specify your
server(s) with optional credentials.

The `servers` property with a valid url is the only requirement. All other
options you'll see below are strictly optional. Not providing them will leave
you with mpv default's.

If you want your history be synced across multiple devices, you can also add
a unique identifier in your config (the choice is up to you, if you are not
:snowflake: enough, someone could have the same).

```json
{
  "servers": [{
    "url": "example.com",
    "credentials": {
      "username": "bob",
      "password": "sup3r-s3cr3t"
    }
  }],
  "fullscreen": true,
  "audio": {
    "preferred": "eng,en,fre,fr"
  },
  "subs": {
    "preferred": "fre,fr",
    "hidden": true
  },
  "sync": "my-super-unique-identifier"
}
```

And let the magic begin.

    samus
