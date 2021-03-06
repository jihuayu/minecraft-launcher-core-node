import * as parser from "fast-html-parser";

/**
 * One forge version download info
 */
interface Download {
    md5: string;
    sha1: string;
    path: string;
}

/**
 * Parse the html string of forge webpage
 */
export function parse(content: string): ForgeWebPage {
    const dom = parser.parse(content);
    const selected = dom.querySelector(".elem-active");
    const mcversion = selected.text;
    return {
        mcversion,
        versions: dom.querySelector(".download-list").querySelector("tbody").querySelectorAll("tr")
            .map((e) => {
                const links = e.querySelector(".download-links").childNodes
                    .filter((elem) => elem.tagName === "li")
                    .map((elem) => {
                        elem = elem.removeWhitespace();
                        /*
                         * <div class="info-tooltip">
                         *   <strong>MD5:</strong> 31742b6c996f53af96f606b7a0c46e2a<br>
                         *   <strong>SHA1:</strong> 8d6a23554839d6f6014fbdb7991e3cd8af7eca80
                         * </div>
                         */
                        const tooltipInfo = elem.querySelector(".info-tooltip");
                        const url = tooltipInfo.querySelector("a") || elem.querySelector("a");
                        // href is like /maven/net/minecraftforge/forge/1.14.4-28.1.70/forge-1.14.4-28.1.70-changelog.txt
                        const href = url.attributes.href.trim();
                        const matched = /forge-.+-.+-(\w+)\.\w+/.exec(href);
                        let name = "", sha1 = "", md5 = "";
                        if (matched) { name = matched[1]; }
                        if (!name) {
                            throw new Error(`Cannot determine name for forge url "${href}". Maybe the forge webisite changed?`);
                        }
                        try {
                            md5 = tooltipInfo.childNodes[1].text.trim();
                            sha1 = tooltipInfo.childNodes[4].text.trim();
                        } catch {
                            console.warn(`Error during fetching the sha1 and md5 for the forge "${href}". The result might be wrong.`);
                        }
                        const isSha1 = /\b([a-f0-9]{40})\b/i
                        const isMd5 = /\b[a-f0-9]{32}\b/i;
                        if (!isMd5.test(md5.trim())) {
                            console.warn(`Illegal Md5 for "${href}": ${md5}`)
                            md5 = "";
                        }
                        if (!isSha1.test(sha1.trim())) {
                            console.warn(`Illegal Sha1 for "${href}": ${sha1}`)
                            sha1 = "";
                        }
                        return {
                            name,
                            md5,
                            sha1,
                            path: href,
                        };
                    });
                const downloadVersionElem = e.querySelector(".download-version");
                let version;
                let type: Version["type"] = "common";
                const icon = downloadVersionElem.querySelector("i");
                if (icon) {
                    if (icon.classNames.indexOf("promo-recommended") !== -1) {
                        type = "recommended";
                    } else if (icon.classNames.indexOf("promo-latest") !== -1) {
                        type = "latest";
                    } else if (icon.classNames.indexOf("fa-bug") !== -1) {
                        type = "buggy";
                    }
                    version = downloadVersionElem.firstChild.text.trim();
                } else {
                    version = downloadVersionElem.text.trim();
                }
                const installer = links.find((l) => l.name === "installer");
                const universal = links.find((l) => l.name === "universal");
                const changelog = links.find((l) => l.name === "changelog");
                const installerWin = links.find((l) => l.name === "installer-win");
                const source = links.find((l) => l.name === "source");
                const launcher = links.find((l) => l.name === "launcher");

                const mdk = links.find((l) => l.name === "mdk");

                if (installer === undefined || universal === undefined) {
                    throw new Error("Cannot parse forge web since it missing installer and universal jar info.");
                }
                const result = {
                    version,
                    "date": e.querySelector(".download-time").text.trim(),
                    changelog,
                    installer,
                    mdk,
                    universal,
                    source,
                    launcher,
                    "installer-win": installerWin,
                    "mcversion": mcversion,
                    type,
                };

                return result;
            }),
    };
}
/**
 * A richer version info than forge installer required
 */
interface Version {
    /**
     * The minecraft version
     */
    mcversion: string;
    /**
     * The version of forge
     */
    version: string;
    date: string;
    /**
     * The changelog info
     */
    changelog?: Download;
    installer: Download;
    mdk?: Download;
    universal: Download;
    source?: Download;
    launcher?: Download;

    /**
     * The type of the forge release. The `common` means the normal release.
     */
    type: "buggy" | "recommended" | "common" | "latest";
}

/**
 * Forge webpack contains the forge versions for a Minecraft version.
 */
export interface ForgeWebPage {
    versions: Version[];
    mcversion: string;
}



