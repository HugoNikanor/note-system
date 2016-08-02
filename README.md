# Note System
A program for notes. Think of it like post-it notes with modules.

## Prerequisites
You will need [Leiningen][] 2.0.0 or above installed.

[leiningen]: https://github.com/technomancy/leiningen

## Running
To start a web server for the application, run:

    lein ring server-headless

## About code
### meta modules
Detonated with the html class "meta-module", should only be applied to modules,
mark that they deal with the note itself, and probably shouldn't be edited by 
the user.
