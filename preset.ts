import { Preset } from "apply";

const newPreprocessor = `mdsvex(mdsvexConfig)`

const addPreprocessor = (otherPreprocessors) => `preprocess: [
		${newPreprocessor},
		${otherPreprocessors}]`;


Preset.setName("svelte-add/mdsvex");

Preset.extract().withTitle("Adding mdsvex config file");

Preset.editJson("package.json").merge({
	devDependencies: {
		"mdsvex": "^0.8.9",
	},
}).withTitle("Adding needed dependencies");

Preset.edit(["svelte.config.cjs"]).update((content) => {
	let result = content;

	const matchSveltePreprocess = /(sveltePreprocess\(.*\))/m;
	result = result.replace(matchSveltePreprocess, (_match, oldPreprocessor) => `[${oldPreprocessor}]`);

	const matchPreprocessors = /preprocess:[\s\r\n]\[[\s\r\n]*((?:.|\r|\n)+)[\s\r\n]*\]/m;
	result = result.replace(matchPreprocessors, (_match, otherPreprocessors) => {
		return addPreprocessor(otherPreprocessors);
	});

	result = `const mdsvexConfig = require("./mdsvex.config.cjs");\n${result}`;
	result = `const { mdsvex } = require("mdsvex");\n${result}`;

	result = result.replace("module.exports = {", `module.exports = {\n\textensions: [".svelte", ...mdsvexConfig.extensions],`);
	if (!result.includes("mdsvex(")) result = result.replace("module.exports = {", `module.exports = {\n\t${addPreprocessor("")},`);

	return result;
}).withTitle("Setting up the mdsvex preprocessor");

Preset.edit(["src/routes/index.svelte"]).update((contents) => {
	const p = `<p>Visit the <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte apps.</p>`;
	return contents.replace(p, `${p}\n\t<p>Visit <a href="/markdown">the /markdown page</a> to see some markdown rendered by mdsvex.</p>`);
}).withTitle("Adding a link on the homepage to show off a markdown route");

Preset.installDependencies().ifUserApproves();