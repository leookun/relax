#!/usr/bin/env node
import { spawn } from "child_process";
import { argv0, argv } from "process";
const isInDebug = argv[3] === "--debug";
const vscodeDebuggerArgs = isInDebug ? ["--inspect=9222", "--inspect-brk"] : [];
spawn(argv0, [...vscodeDebuggerArgs, "--loader", "@leokun/typescript-esm/typescript-esm-loader.js", "--trace-warnings", argv[2]], {
    env: { NODE_NO_WARNINGS: 1, FORCE_COLOR: true },
    stdio: "inherit",
    shell: true,
});