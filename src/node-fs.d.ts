declare module "node:fs" {
  export function writeFileSync(
    path: string,
    data: string,
    encoding: "utf8",
  ): void;
}
