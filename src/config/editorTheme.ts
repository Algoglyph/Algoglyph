import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

// A faithful "VS Code — Dark+" palette so the editor reads like VS Code
// rather than the default blue-gray CodeMirror dark theme.
const bg = '#1e1e1e'; // editor surface (VS Code default dark background)
const fg = '#d4d4d4'; // default foreground text
const caret = '#aeafad';
const selection = '#264f78'; // VS Code active selection
const selectionMatch = '#add6ff26'; // matched-selection tint
const lineHighlight = '#ffffff0a'; // subtle active-line wash
const gutterFg = '#858585';
const gutterActiveFg = '#c6c6c6';

// Syntax colors (VS Code Dark+)
const blue = '#569cd6'; // storage/declaration keywords, booleans
const purple = '#c586c0'; // control + module keywords (import / return / if / while)
const lightBlue = '#9cdcfe'; // identifiers, properties, parameters
const teal = '#4ec9b0'; // types, classes, namespaces
const yellow = '#dcdcaa'; // function names
const orange = '#ce9178'; // strings
const green = '#6a9955'; // comments
const numberGreen = '#b5cea8'; // numeric literals
const constantBlue = '#4fc1ff'; // constants
const red = '#d16969'; // regex / invalid
const sand = '#d7ba7d'; // escapes

const vscodeDarkTheme = EditorView.theme(
  {
    '&': {
      color: fg,
      backgroundColor: bg,
    },
    '.cm-content': {
      caretColor: caret,
      fontFamily:
        '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: caret },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: selection },
    '.cm-selectionMatch': { backgroundColor: selectionMatch },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: '#0a4f7a55',
      outline: '1px solid #888',
    },
    '.cm-activeLine': { backgroundColor: lineHighlight },
    '.cm-gutters': {
      backgroundColor: bg,
      color: gutterFg,
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: gutterActiveFg,
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: gutterActiveFg,
    },
    '.cm-tooltip': {
      backgroundColor: '#252526',
      border: '1px solid #454545',
      color: fg,
    },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: '#04395e',
      color: fg,
    },
    '.cm-panels': { backgroundColor: '#252526', color: fg },
    '.cm-searchMatch': { backgroundColor: '#613214' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#874b1a' },
  },
  { dark: true },
);

const vscodeHighlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier, t.self, t.null], color: blue },
  {
    tag: [t.controlKeyword, t.moduleKeyword, t.definitionKeyword],
    color: purple,
  },
  { tag: [t.name, t.variableName, t.propertyName, t.attributeName], color: lightBlue },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName],
    color: yellow,
  },
  {
    tag: [t.typeName, t.className, t.namespace, t.macroName],
    color: teal,
  },
  { tag: [t.string, t.special(t.string), t.docString], color: orange },
  { tag: [t.escape, t.character], color: sand },
  { tag: [t.number, t.integer, t.float], color: numberGreen },
  { tag: [t.bool, t.atom, t.constant(t.variableName)], color: constantBlue },
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: green, fontStyle: 'italic' },
  { tag: [t.meta, t.processingInstruction], color: purple },
  { tag: [t.regexp], color: red },
  { tag: [t.operator, t.punctuation, t.separator, t.bracket], color: fg },
  { tag: [t.invalid], color: red },
  { tag: [t.heading], color: blue, fontWeight: 'bold' },
  { tag: [t.link, t.url], color: lightBlue, textDecoration: 'underline' },
  { tag: [t.strong], fontWeight: 'bold' },
  { tag: [t.emphasis], fontStyle: 'italic' },
  { tag: [t.strikethrough], textDecoration: 'line-through' },
]);

// Bundle the chrome + syntax highlighting into one extension.
export const vscodeDark: Extension = [
  vscodeDarkTheme,
  syntaxHighlighting(vscodeHighlightStyle),
];
