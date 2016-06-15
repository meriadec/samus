<p align="center">
  <img src="http://media.sigsev.io/samus.jpg" width="200">
</p>

# samus

Samus let you select a file from a basic HTTP website, then launch [mpv](https://mpv.io/) with it.
It was build for personal purposes, but you're welcome!

## Installation

```bash
npm i -g samus
```

## Usage

```bash
samus <url>
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
