#!/usr/bin/env node
import { spawn } from "child_process";
import { argv0, argv } from "process";
spawn(argv0, ["--loader", "@leokun/typescript-esm/typescript-esm-loader.js", "--trace-warnings", argv[2]], {
    env: { NODE_NO_WARNINGS: 1, FORCE_COLOR: true },
    stdio: "inherit",
    shell: true,
});