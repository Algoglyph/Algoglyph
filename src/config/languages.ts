import type { Extension } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { go } from '@codemirror/lang-go';
import { rust } from '@codemirror/lang-rust';

export interface LanguageDef {
  id: string; // internal id, stored per tab
  label: string; // shown in the dropdown
  wandboxLanguage: string; // Wandbox "language" field to match a compiler
  preferPattern?: string; // regex to prefer a specific compiler (e.g. pin Python 3)
  cm: () => Extension; // CodeMirror language extension for highlighting
  starter: string; // boilerplate inserted for a fresh file
}

export const LANGUAGES: LanguageDef[] = [
  {
    id: 'cpp',
    label: 'C++',
    wandboxLanguage: 'C++',
    preferPattern: '^gcc-\\d',
    cm: () => cpp(),
    starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, DSA!" << endl;
    return 0;
}
`,
  },
  {
    id: 'c',
    label: 'C',
    wandboxLanguage: 'C',
    preferPattern: '^gcc-\\d',
    cm: () => cpp(),
    starter: `#include <stdio.h>

int main() {
    printf("Hello, DSA!\\n");
    return 0;
}
`,
  },
  {
    id: 'python',
    label: 'Python',
    wandboxLanguage: 'Python',
    preferPattern: '^cpython-3\\.', // numbered Python 3 (cpython-head is currently broken on Wandbox)
    cm: () => python(),
    starter: `def main():
    print("Hello, DSA!")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'java',
    label: 'Java',
    wandboxLanguage: 'Java',
    // Non-public class: Wandbox compiles into prog.java, so a public class named
    // Main would fail the "must match filename" rule.
    cm: () => java(),
    starter: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, DSA!");
    }
}
`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    wandboxLanguage: 'JavaScript',
    preferPattern: 'nodejs',
    cm: () => javascript(),
    starter: `function main() {
  console.log("Hello, DSA!");
}

main();
`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    wandboxLanguage: 'TypeScript',
    cm: () => javascript({ typescript: true }),
    starter: `function main(): void {
  console.log("Hello, DSA!");
}

main();
`,
  },
  {
    id: 'go',
    label: 'Go',
    wandboxLanguage: 'Go',
    preferPattern: '^go-\\d',
    cm: () => go(),
    starter: `package main

import "fmt"

func main() {
    fmt.Println("Hello, DSA!")
}
`,
  },
  {
    id: 'rust',
    label: 'Rust',
    wandboxLanguage: 'Rust',
    preferPattern: '^rust-\\d',
    cm: () => rust(),
    starter: `fn main() {
    println!("Hello, DSA!");
}
`,
  },
];

export const DEFAULT_LANGUAGE = 'cpp';

export const getLanguage = (id: string): LanguageDef =>
  LANGUAGES.find((l) => l.id === id) ?? LANGUAGES.find((l) => l.id === DEFAULT_LANGUAGE)!;
