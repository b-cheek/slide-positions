declare module "node:fs" {
  export function writeFileSync(
    path: string,
    data: string,
    encoding: "utf8",
  ): void;
}

declare module "node:process" {
  export const stdout: {
    isTTY?: boolean;
    write(message: string): void;
  };
}
