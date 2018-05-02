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
  "sync": "my-super-unique-identifier",
  "autoSelect": true
}
```

And let the magic begin.

    samus

## Watch multiple files

You can create a playlist by pressing `a` on items to select them, before
launching.

## Searching

By pressing `/`, you will enter search mode which will filter the results. It's not
smart, no fuzzy matching and does not find recursively in the folders, but if you're
not happy with this you can create a PR. Press again to exit the search.

## Use with ChromeCast

If you have in your possession this wonderful tool configured correctly, a green
indicator will appear on the top left of samus. You will then be able to press `c`
on any video to cast it, press `space` to pause/unpause and `c` again to stop.
