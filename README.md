# JSON Editor - Psyinf

This is a fork of [json-editor/json-editor](https://github.com/json-editor/json-editor) for use in applications maintained by the [FZJ INM-7 Psychoinformatics group](https://www.psychoinformatics.de).

From the upstream README:

> ![JSON Schema -> HTML Editor -> JSON](./docs/images/jsoneditor.png)

> JSON Editor takes a JSON Schema and uses it to generate an HTML form.
It has full support for JSON Schema version 3 and 4 and can integrate with several popular CSS frameworks (bootstrap, spectre, tailwind).

## Psyinf-specific updates

The [`psyinf` CSS theme](src/themes/psyinf.js) is a copy of the `bootstrap5` theme, with additional changes:
- required fields are annotated visibly (red asterisk)
- validation error dialogs are displayed below the editor element instead of above
- _(more to follow)_

Ideally, all custom JS and CSS code that change the behaviour and style of a form built with the psyinf theme should go into these theme files, and not in the form-specific implementation.

For testing purposes, a Psyinf-specific test implementation was added at `tests/pages/psyinf/index.html`, along with all required assets.

## Example implementation

[https://abcd-j.github.io/schema-form/](https://abcd-j.github.io/schema-form/)

## Development and testing

Main requirements:
- NodeJS
- npm

Clone this repository:

```
git clone https://github.com/psychoinformatics-de/json-editor.git
```

Install NodeJS, preferrably in a virtual environment, here using `miniconda`:

```
conda create -yn jsoneditor nodejs
```

This comes with `npm`, which is used for testing and building the package. From the root directory, run:

```
npm run debug
```

This will start a local server at http://localhost:8080/, which will result in a 404 at first.

Navigate to http://localhost:8080/tests/pages/psyinf/ for real-time testing during development.

## Building a distribution file

From the root directory, run:

```
npm run build
```

This will build the minified distribution file at `dist/jsoneditor.js`. This file can be included in any implementation that wants to use the `psyinf` theme of `json-editor`.


