import {
    resolve as resolveTs,
    getFormat,
    transformSource,
} from "ts-node/esm";
import * as tsConfigPaths from "tsconfig-paths";
export { getFormat, transformSource };
const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig();
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths);

export function resolve(specifier, context, defaultResolver) {
    const mappedSpecifier = matchPath(specifier);
    const isJsFile = /\.js$/.test(mappedSpecifier);
    const isNodeModules = /\/node_modules\//.test(mappedSpecifier);
    if (!isJsFile && !isNodeModules && mappedSpecifier) {
        specifier = `${mappedSpecifier}.js`;
    }
    return resolveTs(specifier, context, defaultResolver);
}