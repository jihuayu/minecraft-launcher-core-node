import Unzip from "@xmcl/unzip";
import { AnnotationVisitor, ClassReader, ClassVisitor, MethodVisitor, Opcodes } from "java-asm";

export namespace Forge {
    class AVisitor extends AnnotationVisitor {
        constructor(readonly map: { [key: string]: any }) { super(Opcodes.ASM5); }
        public visit(s: string, o: any) {
            this.map[s] = o;
        }
    }
    class MVisitor extends MethodVisitor {
        constructor(private parent: KVisitor, api: number) {
            super(api);
        }
        visitInsn(opcode: number): void {
            console.log(opcode);
        }
        visitFieldInsn(opcode: number, owner: string, name: string, desc: string) {
            console.log(opcode, name);
        }
    }

    class KVisitor extends ClassVisitor {
        public fields: { [name: string]: any } = {};
        public className: string = "";
        public isDummyModContainer: boolean = false;

        public commonFields: any = {};
        public constructor(readonly map: { [key: string]: any }) {
            super(Opcodes.ASM5);
        }
        visit(version: number, access: number, name: string, signature: string, superName: string, interfaces: string[]): void {
            this.className = name;
            if (superName === "net/minecraftforge/fml/common/DummyModContainer") {
                this.isDummyModContainer = true;
            }
        }

        public visitMethod(access: number, name: string, desc: string, signature: string, exceptions: string[]) {
            if (this.isDummyModContainer && name === "<init>") {
                return new MVisitor(this, Opcodes.ASM5);
            }
            return null;
        }

        public visitField(access: number, name: string, desc: string, signature: string, value: any) {
            this.fields[name] = value;
            return null;
        }

        public visitAnnotation(desc: string, visible: boolean): AnnotationVisitor | null {
            if (desc === "Lnet/minecraftforge/fml/common/Mod;" || desc === "Lcpw/mods/fml/common/Mod;") { return new AVisitor(this.map); }
            return null;
        }
    }
    export interface Config {
        [category: string]: {
            comment?: string,
            properties: Array<Config.Property<any>>,
        };
    }

    export namespace Config {
        export type Type = "I" | "D" | "S" | "B";
        export interface Property<T = number | boolean | string | number[] | boolean[] | string[]> {
            readonly type: Type;
            readonly name: string;
            readonly comment?: string;
            value: T;
        }

        export function stringify(config: Config) {
            let content = "# Configuration file\n\n\n";
            const propIndent = "    ", arrIndent = "        ";
            Object.keys(config).forEach((cat) => {
                content += `${cat} {\n\n`;
                config[cat].properties.forEach((prop) => {
                    if (prop.comment) {
                        const lines = prop.comment.split("\n");
                        for (const l of lines) {
                            content += `${propIndent}# ${l}\n`;
                        }
                    }
                    if (prop.value instanceof Array) {
                        content += `${propIndent}${prop.type}:${prop.name} <\n`;
                        prop.value.forEach((v) => content += `${arrIndent}${v}\n`);
                        content += `${propIndent}>\n`;
                    } else {
                        content += `${propIndent}${prop.type}:${prop.name}=${prop.value}\n`;
                    }
                    content += "\n";
                });
                content += `}\n\n`;
            });
            return content;
        }

        export function parse(body: string): Config {
            const lines = body.split("\n").map((s) => s.trim())
                .filter((s) => s.length !== 0);
            let category: string | undefined;
            let pendingCategory: string | undefined;

            const parseVal = (type: Type, value: any) => {
                const map: { [key: string]: (s: string) => any } = {
                    I: Number.parseInt,
                    D: Number.parseFloat,
                    S: (s: string) => s,
                    B: (s: string) => s === "true",
                };
                const handler = map[type];
                return handler(value);
            };
            const config: Config = {};
            let inlist = false;
            let comment: string | undefined;
            let last: any;

            const readProp = (type: Type, line: string) => {
                line = line.substring(line.indexOf(":") + 1, line.length);
                const pair = line.split("=");
                if (pair.length === 0 || pair.length === 1) {
                    let value;
                    let name;
                    if (line.endsWith(" <")) {
                        value = [];
                        name = line.substring(0, line.length - 2);
                        inlist = true;
                    } else { }
                    if (!category) {
                        throw {
                            type: "CorruptedForgeConfig",
                            reason: "MissingCategory",
                            line,
                        };
                    }
                    config[category].properties.push(last = { name, type, value, comment } as Property);
                } else {
                    inlist = false;
                    if (!category) {
                        throw {
                            type: "CorruptedForgeConfig",
                            reason: "MissingCategory",
                            line,
                        };
                    }
                    config[category].properties.push({ name: pair[0], value: parseVal(type, pair[1]), type, comment } as Property);
                }
                comment = undefined;
            };
            for (const line of lines) {
                if (inlist) {
                    if (!last) {
                        throw {
                            type: "CorruptedForgeConfig",
                            reason: "CorruptedList",
                            line,
                        };
                    }
                    if (line === ">") { inlist = false; } else if (line.endsWith(" >")) {
                        last.value.push(parseVal(last.type, line.substring(0, line.length - 2)));
                        inlist = false;
                    } else { last.value.push(parseVal(last.type, line)); }
                    continue;
                }
                switch (line.charAt(0)) {
                    case "#":
                        if (!comment) {
                            comment = line.substring(1, line.length).trim();
                        } else {
                            comment = comment.concat("\n", line.substring(1, line.length).trim());
                        }
                        break;
                    case "I":
                    case "D":
                    case "S":
                    case "B":
                        readProp(line.charAt(0) as Type, line);
                        break;
                    case "<":
                        break;
                    case "{":
                        if (pendingCategory) {
                            category = pendingCategory;
                            config[category] = { comment, properties: [] };
                            comment = undefined;
                        } else {
                            throw {
                                type: "CorruptedForgeConfig",
                                reason: "MissingCategory",
                                line,
                            };
                        }
                        break;
                    case "}":
                        category = undefined;
                        break;
                    default:
                        if (!category) {
                            if (line.endsWith("{")) {
                                category = line.substring(0, line.length - 1).trim();
                                config[category] = { comment, properties: [] };
                                comment = undefined;
                            } else {
                                pendingCategory = line;
                            }
                        } else {
                            throw {
                                type: "CorruptedForgeConfig",
                                reason: "Duplicated",
                                line,
                            };
                        }
                }
            }
            return config;
        }
    }

    export interface ModIndentity {
        readonly modid: string;
        readonly version: string;
    }
    export interface MetaData extends ModIndentity {
        readonly modid: string;
        readonly name: string;
        readonly description?: string;
        readonly version: string;
        readonly mcversion?: string;
        readonly acceptedMinecraftVersions?: string;
        readonly updateJSON?: string;
        readonly url?: string;
        readonly logoFile?: string;
        readonly authorList?: string[];
        readonly credits?: string;
        readonly parent?: string;
        readonly screenShots?: string[];
        readonly fingerprint?: string;
        readonly dependencies?: string;
        readonly accpetRemoteVersions?: string;
        readonly acceptSaveVersions?: string;
        readonly isClientOnly?: boolean;
        readonly isServerOnly?: boolean;
    }

    async function asmMetaData(zip: Unzip.CachedZipFile, entry: Unzip.Entry, modidTree: any, guessing: any) {
        const data = await zip.readEntry(entry);
        const metaContainer: any = {};
        const visitor = new KVisitor(metaContainer);
        new ClassReader(data).accept(visitor);
        if (Object.keys(metaContainer).length === 0) {
            if (visitor.className === "Config" && visitor.fields && visitor.fields.OF_NAME) {
                metaContainer.modid = visitor.fields.OF_NAME;
                metaContainer.name = visitor.fields.OF_NAME;
                metaContainer.mcversion = visitor.fields.MC_VERSION;
                metaContainer.version = `${visitor.fields.OF_EDITION}_${visitor.fields.OF_RELEASE}`;
                metaContainer.description = "OptiFine is a Minecraft optimization mod. It allows Minecraft to run faster and look better with full support for HD textures and many configuration options.";
                metaContainer.authorList = ["sp614x"];
                metaContainer.url = "https://optifine.net";
                metaContainer.isClientOnly = true;
            }
        }
        for (const [k, v] of Object.entries(visitor.fields)) {
            switch (k) {
                case "MODID":
                case "MOD_ID":
                    guessing.modid = v;
                    break;
                case "MODNAME":
                case "MOD_NAME":
                    guessing.name = v;
                    break;
                case "VERSION":
                case "MOD_VERSION":
                    guessing.name = v;
                    break;
            }
        }
        const modid = metaContainer.modid;
        let modMeta = modidTree[modid];
        if (!modMeta) {
            modMeta = {};
            modidTree[modid] = modMeta;
        }

        for (const propKey in metaContainer) {
            modMeta[propKey] = metaContainer[propKey];
        }
    }

    async function jsonMetaData(zip: Unzip.CachedZipFile, entry: Unzip.Entry, modidTree: any) {
        try {
            const json = JSON.parse(await zip.readEntry(entry).then((b) => b.toString("utf-8")));
            if (json instanceof Array) {
                for (const m of json) { modidTree[m.modid] = m; }
            } else if (json.modList instanceof Array) {
                for (const m of json.modList) { modidTree[m.modid] = m; }
            } else if (json.modid) {
                modidTree[json.modid] = json;
            }
        } catch (e) { }
    }

    async function regulize(mod: Buffer | string | Unzip.CachedZipFile) {
        let zip;
        if (mod instanceof Buffer || typeof mod === "string") {
            zip = await Unzip.open(mod);
        } else {
            zip = mod;
        }
        return zip;
    }
    /**
     * Read metadata of the input mod.
     *
     * @param mod The mod path or data
     */
    export async function readModMetaData(mod: Buffer | string | Unzip.CachedZipFile) {
        const zip = await regulize(mod);
        const modidTree: any = {};
        const promise: Array<Promise<void>> = [];
        const inf = zip.entries["mcmod.info"];
        if (inf) {
            promise.push(jsonMetaData(zip, inf, modidTree));
        }
        const guessing: any = {}; // placeholder for guessing data, try handle the forge core mod
        promise.push(...zip.filterEntries((e) => e.fileName.endsWith(".class"))
            .map((e) => asmMetaData(zip, e, modidTree, guessing)));
        await Promise.all(promise);
        const modids = Object.keys(modidTree);
        if (modids.length === 0) { throw { type: "NonmodTypeFile" }; }
        return modids.map((k) => modidTree[k] as Forge.MetaData)
            .filter((m) => m.modid !== undefined);
    }

    export async function meta(mod: Buffer | string | Unzip.CachedZipFile) {
        return readModMetaData(mod);
    }

    export const DEFAULT_FORGE_MAVEN = "http://files.minecraftforge.net";
}

export default Forge;
