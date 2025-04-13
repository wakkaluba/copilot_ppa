// Type definitions for glob 8.1
// Project: https://github.com/isaacs/node-glob
// Definitions based on glob types but simplified for our use case

declare module 'glob' {
  namespace glob {
    interface IOptions {
      cwd?: string;
      root?: string;
      dot?: boolean;
      nomount?: boolean;
      mark?: boolean;
      nosort?: boolean;
      stat?: boolean;
      silent?: boolean;
      strict?: boolean;
      cache?: { [path: string]: boolean | 'DIR' | 'FILE' | ReadonlyArray<string> };
      statCache?: { [path: string]: false | { isDirectory(): boolean } };
      symlinks?: { [path: string]: boolean };
      sync?: boolean;
      nounique?: boolean;
      nonull?: boolean;
      debug?: boolean;
      nobrace?: boolean;
      noglobstar?: boolean;
      noext?: boolean;
      nocase?: boolean;
      matchBase?: boolean;
      nodir?: boolean;
      ignore?: string | ReadonlyArray<string>;
      follow?: boolean;
      realpath?: boolean;
      absolute?: boolean;
    }
  }

  function glob(pattern: string, callback: (err: Error | null, matches: string[]) => void): void;
  function glob(pattern: string, options: glob.IOptions, callback: (err: Error | null, matches: string[]) => void): void;

  export = glob;
}